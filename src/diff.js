/*
 * @Author: Hale
 * @Description: 核心 Diff 算法，这里实现了三种 Diff 算法
 * @Date: 2019/10/20
 * @LastEditTime: 2019/10/20
 */

import { lis } from './util'

// 没有 key 的 Diff 算法，简单粗暴
export function noneKeyDiff(
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
  let lastIndex = 0 // prevChildren 最大的索引
  for (let i = 0; i < nextChildren.length; i++) {
    const nextVNode = nextChildren[i]
    let j = 0,
      canFind = false
    for (j; j < prevChildren.length; j++) {
      const prevVNode = prevChildren[j]
      if (nextVNode.key === prevVNode.key) {
        canFind = true
        patch(prevVNode, nextVNode, container)
        // 移动节点
        if (j < lastIndex) {
          const refNode = nextChildren[i - 1].el.nextSibling
          container.insertBefore(prevVNode.el, refNode)
        } else {
          lastIndex = j
        }
      }
    }

    // 新增节点
    if (!canFind) {
      const refNode =
        i - 1 < 0 ? prevChildren[0].el : nextChildren[i - 1].nextSibling
      mount(nextVNode, container, false, refNode)
    }
  }

  // 删除不存在的节点
  for (let i = 0; i < prevChildren.length; i++) {
    const prevVNode = prevChildren[i]
    const has = nextChildren.find(nextVnode => nextVnode.key === prevVNode.key)
    if (!has) {
      container.removeChild(prevVNode.el)
    }
  }
}

// Vue2 Diff
export function twoSideDiff(
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
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)
      oldStartVNode = prevChildren[++oldStartIdx]
      newEndVNode = nextChildren[--newEndIdx]
    } else if (oldEndVNode.key === newStartVNode.key) {
      patch(oldEndVNode, newStartVNode, container)
      container.insertBefore(oldEndIdx.el, oldStartVNode.el)
      oldEndVNode = prevChildren[--oldEndIdx]
      newStartVNode = nextChildren[++newStartIdx]
    } else {
      console.log(prevChildren)
      const idxInOld = prevChildren.findIndex(
        VNode => VNode && VNode.key === newStartVNode.key
      )
      if (idxInOld > -1) {
        const VNodeToMove = prevChildren[idxInOld]
        patch(VNodeToMove, newStartVNode, container)
        container.insertBefore(VNodeToMove.el, oldStartVNode.el)
        prevChildren[idxInOld] = undefined
      } else {
        mount(newStartVNode, container, false, oldStartVNode.el)
      }
      newStartVNode = nextChildren[++newStartIdx]
    }
  }

  if (oldEndIdx < oldStartIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mount(nextChildren[i], container, false, oldStartVNode.el)
    }
  } else if (newEndIdx < newStartIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      container.removeChild(prevChildren[i].el)
    }
  }
}

// Vue3 Diff
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
    // 去前缀
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

    // 去后缀
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

  if (j > prevEnd && j <= nextEnd) {
    const nextPos = nextEnd + 1
    const refNode =
      nextPos < nextChildren.length ? nextChildren[nextPos].el : null
    while (j <= nextEnd) {
      mount(nextChildren[j++], container, false, refNode)
    }
  } else if (j > nextEnd) {
    while (j <= prevEnd) {
      container.removeChild(prevChildren[j++].el)
    }
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

    let keyIndex = {}
    for (let i = nextStart; i <= nextEnd; i++) {
      keyIndex[nextChildren[i].key] = i
    }
    let patched = 0
    for (let i = prevStart; i <= prevEnd; i++) {
      prevVNode = prevChildren[i]

      if (patched < nextLeft) {
        const k = keyIndex[prevVNode.key]
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
