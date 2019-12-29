/*
 * @Author: Hale
 * @Description: 核心 Diff 算法，这里实现了三种 Diff 算法
 * @Date: 2019/10/20
 * @LastEditTime : 2019/12/29
 */

import { lis } from './util'

// 没有 key 的 Diff 算法，简单粗暴
export function unKeyedDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  const prevLen = prevChildren.length
  const nextLen = nextChildren.length
  const commonLen = prevLen > nextLen ? nextLen : prevLen

  for (let i = 0; i < commonLen; i++) {
    patch(prevChildren[i], nextChildren[i], container)
  }

  if (prevLen < nextLen) {
    for (let i = commonLen; i < nextLen; i++) {
      mount(nextChildren[i], container)
    }
  }

  if (prevLen > nextLen) {
    for (let i = commonLen; i < prevLen; i++) {
      container.removeChild(prevChildren[i].el)
    }
  }
}

// React Diff
export function commonDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  debugger
  let lastIndex = 0 // prevChildren 最大索引值，初始值是 0
  for (let i = 0; i < nextChildren.length; i++) {
    const nextVNode = nextChildren[i]
    let j = 0,
      canFind = false
    for (j; j < prevChildren.length; j++) {
      const prevVNode = prevChildren[j]
      if (nextVNode.key === prevVNode.key) {
        canFind = true
        patch(prevVNode, nextVNode, container) // 复用旧节点 -> 更新值
        // 比最大索引小时（即索引变大时，从前往后移，有缺陷）-> 移动 DOM
        if (j < lastIndex) {
          const refNode = nextChildren[i - 1].el.nextSibling // 参考节点：前一个 VNode 的 DOM 的下一个节点
          container.insertBefore(prevVNode.el, refNode) // 移动到参考节点前面 -> 即前一个 VNode 的 DOM 的后面
        } else {
          lastIndex = j // 更新 lastIndex 的值
        }
      }
    }

    // 新增节点 -> prevChildren 的节点中找不到对应的 key
    if (!canFind) {
      const refNode =
        i - 1 < 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling
      mount(nextVNode, container, false, refNode)
    }
  }

  // 删除节点 -> nextChildren 的节点中不存在对应的 key
  for (let i = 0; i < prevChildren.length; i++) {
    const prevVNode = prevChildren[i]
    const has = nextChildren.find(nextVnode => nextVnode.key === prevVNode.key)
    if (!has) {
      container.removeChild(prevVNode.el)
    }
  }
}

// Vue2 Diff -> 双端比较
export function doubleSideDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  let oldStartIdx = 0
  let oldEndIdx = prevChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = nextChildren.length - 1
  let oldStartVNode = prevChildren[oldStartIdx]
  let oldEndVNode = prevChildren[oldEndIdx]
  let newStartVNode = nextChildren[newStartIdx]
  let newEndVNode = nextChildren[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = prevChildren[++oldStartIdx]
    } else if (!oldEndVNode) {
      oldEndVNode = prevChildren[--oldEndIdx]
    } else if (oldStartVNode.key === newStartVNode.key) {
      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = prevChildren[++oldStartIdx]
      newStartVNode = nextChildren[++newStartIdx]
    } else if (oldEndVNode.key === newEndVNode.key) {
      patch(oldEndVNode, newEndVNode, container)
      oldEndVNode = prevChildren[--oldEndIdx]
      newEndVNode = nextChildren[--newEndIdx]
    } else if (oldStartVNode.key === newEndVNode.key) {
      patch(oldStartVNode, newEndVNode, container)
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling) // 头节点的 DOM 移到尾节点的 DOM 的后面
      oldStartVNode = prevChildren[++oldStartIdx]
      newEndVNode = nextChildren[--newEndIdx]
    } else if (oldEndVNode.key === newStartVNode.key) {
      patch(oldEndVNode, newStartVNode, container)
      container.insertBefore(oldEndVNode.el, oldStartVNode.el) // 尾节点的 DOM 移到头节点的 DOM 前面
      oldEndVNode = prevChildren[--oldEndIdx]
      newStartVNode = nextChildren[++newStartIdx]
    } else {
      // 双端比较找不到相同的 key 时
      // 查找和新头节点相同 key 的旧节点
      const idxInOld = prevChildren.findIndex(
        VNode => VNode && VNode.key === newStartVNode.key
      )

      // 查找到，需要 patch 和把这个节点移动到旧头节点前面（最前面）
      // 最后把这个节点原来的位置的值设为 undefined -> 后面如果遍历到这个节点时需要移位
      if (idxInOld > -1) {
        const VNodeToMove = prevChildren[idxInOld]
        patch(VNodeToMove, newStartVNode, container)
        container.insertBefore(VNodeToMove.el, oldStartVNode.el)
        prevChildren[idxInOld] = undefined
      } else {
        // 查找不到，说明是新增的节点，直接挂载到旧头节点的 DOM 前面
        mount(newStartVNode, container, false, oldStartVNode.el)
      }
      newStartVNode = nextChildren[++newStartIdx] // 更新新头节点
    }
  }

  // 循环结束后
  // 新增节点 -> 旧尾索引比旧头索引大（旧节点数量比新节点少）
  if (oldEndIdx < oldStartIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mount(nextChildren[i], container, false, oldStartVNode.el)
    }
    // 删除节点 -> 新尾索引比新头索引大（新节点数量比旧节点少）
  } else if (newEndIdx < newStartIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      container.removeChild(prevChildren[i].el)
    }
  }
}

// Vue3 Diff ???
export function advancedDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  let j = 0
  let prevVNode = prevChildren[j]
  let nextVNode = nextChildren[j]
  let prevEnd = prevChildren.length - 1
  let nextEnd = nextChildren.length - 1

  out: {
    // 去相同前置 -> 向后遍历，直到 key 不同
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container)
      j++
      if (j > prevEnd || j > nextEnd) {
        break out
      }
      prevVNode = prevChildren[j]
      nextVNode = nextChildren[j]
    }

    prevVNode = prevChildren[prevEnd]
    nextVNode = nextChildren[nextEnd]

    // 去相同后置 -> 向前遍历，直到 key 不同
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container)
      prevEnd--
      nextEnd--
      if (j > prevEnd || j > nextEnd) {
        break out
      }
      prevVNode = prevChildren[prevEnd]
      nextVNode = nextChildren[nextEnd]
    }
  }

  // 新值节点 -> j ~ nextEnd 之间的节点应该被添加
  if (j > prevEnd && j <= nextEnd) {
    const nextPos = nextEnd + 1
    const refNode =
      nextPos < nextChildren.length ? nextChildren[nextPos].el : null
    while (j <= nextEnd) {
      mount(nextChildren[j++], container, false, refNode)
    }
    // 删除节点 -> j ~ prevEnd 之间的节点应该被删除
  } else if (j > nextEnd) {
    while (j <= prevEnd) {
      container.removeChild(prevChildren[j++].el)
    }
    // 移动节点
  } else {
    const nextLeft = nextEnd - j + 1
    const source = []
    for (let i = 0; i < nextLeft; i++) {
      source.push(-1)
    }

    const prevStart = j
    const nextStart = j
    let moved = false
    let pos = 0

    let keyIndex = {} // k 的索引表
    for (let i = nextStart; i <= nextEnd; i++) {
      keyIndex[nextChildren[i].key] = i
    }
    let patched = 0
    for (let i = prevStart; i <= prevEnd; i++) {
      prevVNode = prevChildren[i]

      if (patched < nextLeft) {
        const k = keyIndex[prevVNode.key] // 快速查找 k
        if (typeof k !== 'undefined') {
          nextVNode = nextChildren[k]
          patch(prevVNode, nextVNode, container)
          patched++
          source[k - nextStart] = i
          if (k < pos) {
            moved = true
          } else {
            pos = k
          }
        } else {
          container.removeChild(prevVNode.el)
        }
      } else {
        container.removeChild(prevVNode.el)
      }
    }

    if (moved) {
      const seq = lis(source)
      let j = seq.length - 1
      for (let i = nextLeft - 1; i >= 0; i--) {
        if (source[i] === -1) {
          const pos = i + nextStart
          const nextVNode = nextChildren[pos]
          const nextPos = pos + 1
          mount(
            nextVNode,
            container,
            false,
            nextPos < nextChildren.length ? nextChildren[nextPos].el : null
          )
        } else if (i !== seq[j]) {
          const pos = i + nextStart
          const nextVNode = nextChildren[pos]
          const nextPos = pos + 1
          container.insertBefore(
            nextVNode.el,
            nextPos < nextChildren.length ? nextChildren[nextPos].el : null
          )
        } else {
          j--
        }
      }
    }
  }
}
