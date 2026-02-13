# Point Cloud Algorithms — 이론 및 구현

이 프로젝트에서 포인트 클라우드 처리를 위해 사용한 알고리즘들의 수학적 배경과 구현 방법을 정리한다.

---

## 목차

1. [KD-Tree — 공간 인덱싱](#1-kd-tree--공간-인덱싱)
2. [Eigen Decomposition — 고유값 분해](#2-eigen-decomposition--고유값-분해)
3. [Normal Estimation — 법선 벡터 추정](#3-normal-estimation--법선-벡터-추정)
4. [Region Growing — 영역 성장 세그멘테이션](#4-region-growing--영역-성장-세그멘테이션)
5. [PCA 기반 OBB — 바운딩 박스 생성](#5-pca-기반-obb--바운딩-박스-생성)
6. [전체 파이프라인](#6-전체-파이프라인)

---

## 1. KD-Tree — 공간 인덱싱

> 소스: `utils/kdTree.ts`

### 이론

KD-Tree(K-Dimensional Tree)는 k차원 공간에서 점들을 효율적으로 검색하기 위한 이진 트리 자료구조다. 각 레벨에서 하나의 축(x → y → z → x → ...)을 기준으로 공간을 반으로 분할한다.

- **구축**: O(n log n) — 매 레벨에서 중앙값 기준으로 분할
- **최근접 이웃 탐색**: 평균 O(log n) — 가지치기로 불필요한 서브트리를 건너뜀
- **범위 탐색**: 반경 내 모든 점 탐색 가능

### 구현

```
buildNode(positions, indices, depth):
  if |indices| ≤ LEAF_SIZE(32):
    return Leaf(indices)

  axis = depth % 3          // x(0) → y(1) → z(2) 순환
  sort indices by positions[i][axis]
  mid = |indices| / 2
  splitValue = positions[indices[mid]][axis]

  return Branch(axis, splitValue,
    left  = buildNode(indices[0..mid-1], depth+1),
    right = buildNode(indices[mid..n],   depth+1))
```

**탐색 알고리즘 3가지:**

| 함수 | 용도 | 방식 |
|------|------|------|
| `findNearestPoint` | 가장 가까운 1개 점 | best-first + 가지치기 |
| `findKNearest` | K개 최근접 이웃 | max-heap(크기 K) 유지하며 탐색 |
| `findNeighborsInRadius` | 반경 내 모든 점 | 반경 r 기준 가지치기 |

가지치기 조건: 쿼리 점에서 분할 평면까지의 거리가 현재 최선 거리보다 크면 반대쪽 서브트리를 탐색하지 않는다.

```
search(node):
  diff = query[axis] - splitValue
  first  = diff < 0 ? left : right    // 가까운 쪽 먼저
  second = diff < 0 ? right : left

  search(first)
  if diff² < bestDist:                // 분할면이 충분히 가까우면
    search(second)                    // 반대쪽도 탐색
```

---

## 2. Eigen Decomposition — 고유값 분해

> 소스: `utils/eigenDecomposition.ts`

### 이론

대칭 행렬 A에 대해 다음을 만족하는 고유값 λ와 고유벡터 v를 구한다:

```
A · v = λ · v
```

3x3 대칭 행렬은 항상 3개의 실수 고유값을 가지며, 고유벡터는 서로 직교한다. 이 성질이 법선 추정과 PCA의 수학적 기반이 된다.

### Jacobi 회전법

외부 라이브러리 없이 3x3 행렬에 특화된 Jacobi 반복법을 구현했다.

**원리**: 행렬의 비대각 원소를 Givens 회전으로 하나씩 0에 가깝게 만들면, 대각 원소가 고유값으로 수렴한다.

```
V = I (단위 행렬, 고유벡터 누적용)

repeat (최대 50회):
  (p, q) = 가장 큰 |A[p][q]| 를 가진 비대각 위치

  if |A[p][q]| < ε:  break  // 수렴

  // Givens 회전 각도 계산
  if |A[p][p] - A[q][q]| < ε:
    θ = π/4
  else:
    τ = (A[q][q] - A[p][p]) / (2·A[p][q])
    t = sign(τ) / (|τ| + √(1 + τ²))
    cos = 1 / √(1 + t²)
    sin = t · cos

  // 행렬 업데이트: A' = Gᵀ · A · G
  A[p][p] = cos²·A[p][p] - 2·sin·cos·A[p][q] + sin²·A[q][q]
  A[q][q] = sin²·A[p][p] + 2·sin·cos·A[p][q] + cos²·A[q][q]
  A[p][q] = A[q][p] = 0
  ...

  // 고유벡터 누적: V' = V · G
  for each row r:
    V[r][p] = cos·V[r][p] - sin·V[r][q]
    V[r][q] = sin·V[r][p] + cos·V[r][q]

결과: 대각(A) = 고유값, V의 열 = 고유벡터
고유값 내림차순 정렬하여 반환
```

**왜 Jacobi인가?**
- 3x3 대칭 행렬에서는 50회 미만으로 수렴 (보통 3~5회)
- 외부 의존성 없이 ~90줄로 구현 가능
- 수치적으로 안정적

---

## 3. Normal Estimation — 법선 벡터 추정

> 소스: `utils/normalEstimation.ts`

### 이론

포인트 클라우드에는 메시와 달리 면(face) 정보가 없으므로, 각 점의 법선을 주변 이웃 점들의 분포로부터 추정해야 한다. **국소 평면 피팅(Local Plane Fitting)** 방법을 사용한다.

핵심 아이디어: 점 p 주변의 K개 이웃이 대략 하나의 평면 위에 있다면, 그 이웃들의 **공분산 행렬에서 가장 작은 고유값에 대응하는 고유벡터**가 그 평면의 법선이 된다.

```
         ·  ·  ·
      ·     ·     ·       ← 이웃 점들이 평면 형태로 분포
    ·    ·  p  ·    ·
      ·     ·     ·       ↑ 법선 = 분산이 가장 작은 방향
         ·  ·  ·
```

### 구현

각 점 pᵢ에 대해:

```
1. KD-Tree로 K=15 최근접 이웃 탐색

2. 이웃들의 중심(centroid) 계산
   c = (1/K) Σ p_neighbor

3. 3x3 공분산 행렬 계산
   C = Σ (p_neighbor - c)(p_neighbor - c)ᵀ

   C = | Σdx·dx  Σdx·dy  Σdx·dz |
       | Σdy·dx  Σdy·dy  Σdy·dz |   (대칭 행렬)
       | Σdz·dx  Σdz·dy  Σdz·dz |

4. Eigen decomposition → λ₁ ≥ λ₂ ≥ λ₃

5. 법선 = λ₃에 대응하는 고유벡터 (분산이 가장 작은 방향)
```

**직관적 이해:**
- λ₁ 방향: 점들이 가장 많이 퍼진 방향 (평면의 장축)
- λ₂ 방향: 두 번째로 퍼진 방향 (평면의 단축)
- λ₃ 방향: 점들이 가장 적게 퍼진 방향 = **평면에 수직 = 법선**

**파라미터:**
- K=15: 이웃 개수. 작으면 노이즈에 민감, 크면 곡면 디테일을 놓침

---

## 4. Region Growing — 영역 성장 세그멘테이션

> 소스: `utils/regionGrowing.ts`

### 이론

Region Growing은 시드(seed) 점에서 시작하여 유사한 속성을 가진 이웃 점들을 BFS로 확장해 하나의 영역(segment)을 만드는 알고리즘이다. 여기서는 **법선 벡터의 유사도**를 기준으로 사용한다.

같은 평면(벽, 바닥, 차량 표면 등)에 속하는 점들은 법선 방향이 유사하다는 가정에 기반한다.

### 구현

```
Input:
  seed       — 시작 점 인덱스
  positions  — 전체 포인트 위치
  normals    — 전체 포인트 법선
  params:
    normalThreshold = 30°    — 법선 각도 허용 범위
    maxDistance      = 0.5m   — 이웃 탐색 반경
    maxRegionSize   = 4000   — 최대 영역 크기

cosThreshold = cos(30°) ≈ 0.866

queue = [seed]
visited = {seed}
region = []

while queue not empty AND |region| < maxRegionSize:
  idx = queue.dequeue()
  region.add(idx)

  // KD-Tree 반경 탐색으로 이웃 점 획득
  neighbors = findNeighborsInRadius(tree, pos[idx], maxDistance)

  n_current = normals[idx]      // 현재 점의 법선

  for each neighbor ni:
    if ni in visited: skip
    visited.add(ni)

    n_neighbor = normals[ni]
    dot = |n_current · n_neighbor|   // abs: 법선 방향 부호 무관

    if dot ≥ cosThreshold:           // 각도 차이 ≤ 30°
      queue.enqueue(ni)

Output: region (점 인덱스 배열)
```

**설계 결정:**
- **법선 dot product에 절대값 사용**: 법선은 방향이 반대일 수 있다 (같은 평면인데 한쪽은 +z, 다른쪽은 -z). `|dot|`으로 이를 처리.
- **현재 점 기준 비교**: 시드 기준이 아닌 현재 확장 중인 점의 법선과 비교하여, 완만하게 굽은 표면도 따라갈 수 있다.
- **maxRegionSize 제한**: 바닥처럼 거대한 평면이 전체로 퍼지는 것을 방지.

---

## 5. PCA 기반 OBB — 바운딩 박스 생성

> 소스: `utils/computeOBB.ts`

### 이론

**OBB(Oriented Bounding Box)** 는 축 정렬이 아닌, 점군의 분포 방향에 맞게 회전된 최소 바운딩 박스다. **PCA(Principal Component Analysis)** 로 점군의 주축을 구하면 이 축들이 OBB의 방향이 된다.

```
  AABB (축 정렬):              OBB (주축 정렬):
  ┌──────────────┐             ╱─────────╲
  │  ╱╱╱╱╱╱╱    │            ╱  ╱╱╱╱╱╱╱  ╲
  │ ╱╱╱╱╱╱╱     │           ╱  ╱╱╱╱╱╱╱    ╲
  │╱╱╱╱╱╱╱      │           ╲  ╱╱╱╱╱╱╱    ╱
  │              │            ╲  ╱╱╱╱╱╱╱  ╱
  └──────────────┘             ╲─────────╱
  (빈 공간 많음)               (꼭 맞음)
```

### 구현

```
Input: indices (선택된 점들), positions (전체 포인트)

── Step 1: 중심(centroid) 계산 ──
c = (1/n) Σ p[i]

── Step 2: 공분산 행렬 ──
C = (1/n) Σ (p[i] - c)(p[i] - c)ᵀ

── Step 3: Eigen decomposition ──
C = V · Λ · Vᵀ
→ λ₁ ≥ λ₂ ≥ λ₃ (고유값)
→ v₁, v₂, v₃    (고유벡터 = 주축)

── Step 4: 오른손 좌표계 보장 ──
v₃' = v₁ × v₂ (외적)
if v₃' · v₃ < 0:   // 방향이 반대면
  v₃ = -v₃          // 뒤집기

── Step 5: 주축에 점 투영하여 범위 계산 ──
for each point p[i]:
  proj_k = (p[i] - c) · v_k    (k = 0,1,2)
  min_k = min(min_k, proj_k)
  max_k = max(max_k, proj_k)

── Step 6: 박스 중심 & 크기 ──
halfExtents = [(max_k - min_k) / 2]  for k = 0,1,2

// centroid ≠ box center (분포가 비대칭일 수 있으므로 보정)
mid_k = (min_k + max_k) / 2
center = c + mid₀·v₀ + mid₁·v₁ + mid₂·v₂

Output: OBB { center, halfExtents, axes: [v₀, v₁, v₂] }
```

### 시각화 (Three.js)

OBB는 raw 포인트 클라우드 좌표계에서 계산되므로, 시각화 시 포인트 클라우드와 동일한 좌표 변환을 적용해야 한다:

```
Transform = R_pointcloud × T(center) × R(axes) × S(halfExtents × 2)

여기서:
  R_pointcloud = RotationX(-90°)   // 포인트 클라우드의 좌표 변환
  T(center)    = 이동 행렬
  R(axes)      = OBB 축을 열로 갖는 회전 행렬
  S(...)       = 스케일 행렬 (단위 큐브 → 실제 크기)
```

이 전체를 하나의 4x4 행렬로 합성하여 `mesh.matrix`에 직접 할당한다 (`matrixAutoUpdate=false`).

---

## 6. 전체 파이프라인

```
포인트 클라우드 로드 (.bin)
       │
       ▼
 ┌─────────────────────┐
 │  KD-Tree 구축        │  O(n log n)
 │  (공간 인덱싱)       │
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │  법선 벡터 추정       │  각 점마다 K=15 이웃의
 │  (PCA on neighbors)  │  공분산 → 최소 고유벡터
 └─────────┬───────────┘
           │
           ▼
    사용자가 점 클릭
           │
           ▼
 ┌─────────────────────┐
 │  Region Growing      │  법선 유사도 기반 BFS
 │  (세그멘테이션)       │  30° 이내, 반경 0.5m
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │  PCA → OBB           │  선택 영역의 공분산 →
 │  (바운딩 박스)        │  주축 + 투영 범위
 └─────────┬───────────┘
           │
           ▼
    와이어프레임 큐보이드 렌더링
```

### 소스 파일 매핑

| 알고리즘 | 파일 | 핵심 함수 |
|---------|------|----------|
| KD-Tree | `utils/kdTree.ts` | `buildKDTree`, `findKNearest`, `findNeighborsInRadius` |
| Eigen 분해 | `utils/eigenDecomposition.ts` | `eigenDecomposition3x3` |
| 법선 추정 | `utils/normalEstimation.ts` | `computeNormals` |
| Region Growing | `utils/regionGrowing.ts` | `regionGrow` |
| OBB 계산 | `utils/computeOBB.ts` | `computeOBB` |
| OBB 시각화 | `components/Scene/AutoCuboidVisualization.tsx` | `OBBWireframe` |

### 공통 핵심: 공분산 행렬 + Eigen 분해

법선 추정과 OBB 계산은 모두 같은 수학적 구조를 공유한다:

1. 점 집합의 **공분산 행렬** 계산 (3x3 대칭)
2. **고유값 분해**로 주축 추출
3. 목적에 따라 다른 고유벡터를 사용:
   - **법선 추정**: 가장 작은 고유값의 고유벡터 (분산 최소 방향 = 면에 수직)
   - **OBB**: 모든 고유벡터 (분산 방향 = 박스의 축)
