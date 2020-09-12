import { lis } from "./util";

// 没有 key 的 Diff 算法，简单粗暴
export function unKeyedDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  const prevLen = prevChildren.length;
  const nextLen = nextChildren.length;
  const commonLen = prevLen > nextLen ? nextLen : prevLen;

  for (let i = 0; i < commonLen; i++) {
    patch(prevChildren[i], nextChildren[i], container);
  }

  if (prevLen < nextLen) {
    for (let i = commonLen; i < nextLen; i++) {
      mount(nextChildren[i], container);
    }
  }

  if (prevLen > nextLen) {
    for (let i = commonLen; i < prevLen; i++) {
      container.removeChild(prevChildren[i].el);
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
  let lastIndex = 0; // prevChildren 最大索引值，初始值是 0
  for (let i = 0; i < nextChildren.length; i++) {
    const nextVNode = nextChildren[i];
    let j = 0;
    let canFind = false;
    for (j; j < prevChildren.length; j++) {
      const prevVNode = prevChildren[j];
      if (nextVNode.key === prevVNode.key) {
        canFind = true;
        patch(prevVNode, nextVNode, container); // 复用旧节点 -> 更新值
        // 比当前的最大索引小时，需要移动真实节点
        if (j < lastIndex) {
          const refNode = nextChildren[i - 1].el.nextSibling; // 参考节点：前一个 VNode 的真实节点的下一个兄弟节点
          container.insertBefore(prevVNode.el, refNode); // 移动到参考节点的前面，即前一个真实节点的后面
        } else {
          lastIndex = j; // 更新 lastIndex 的值
        }
      }
    }

    // 新增节点，紧跟在前一个节点后面或者最前面
    if (!canFind) {
      const refNode =
        i - 1 < 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling;
      mount(nextVNode, container, false, refNode);
    }
  }

  // 删除节点 -> nextChildren 的节点中不存在对应的 key 的节点
  for (let i = 0; i < prevChildren.length; i++) {
    const prevVNode = prevChildren[i];
    const has = nextChildren.find(
      (nextVnode) => nextVnode.key === prevVNode.key
    );
    if (!has) {
      container.removeChild(prevVNode.el);
    }
  }
}

// Vue2 snabbdom Diff -> 双端比较，普适性更强
export function doubleSideDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  let oldStartIdx = 0;
  let oldEndIdx = prevChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = nextChildren.length - 1;
  let oldStartVNode = prevChildren[oldStartIdx];
  let oldEndVNode = prevChildren[oldEndIdx];
  let newStartVNode = nextChildren[newStartIdx];
  let newEndVNode = nextChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = prevChildren[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = prevChildren[--oldEndIdx];
    } else if (oldStartVNode.key === newStartVNode.key) {
      patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = prevChildren[++oldStartIdx];
      newStartVNode = nextChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = prevChildren[--oldEndIdx];
      newEndVNode = nextChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      patch(oldStartVNode, newEndVNode, container);
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling); // 头节点的 DOM 移到尾节点的 DOM 的后面
      oldStartVNode = prevChildren[++oldStartIdx];
      newEndVNode = nextChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      patch(oldEndVNode, newStartVNode, container);
      container.insertBefore(oldEndVNode.el, oldStartVNode.el); // 尾节点的 DOM 移到头节点的 DOM 前面
      oldEndVNode = prevChildren[--oldEndIdx];
      newStartVNode = nextChildren[++newStartIdx];
    } // 双端比较找不到相同的 key 时
    else {
      // 查找和新头节点相同 key 的旧节点
      const idxInOld = prevChildren.findIndex(
        (VNode) => VNode && VNode.key === newStartVNode.key
      );

      // 查找到，需要 patch 和把这个节点移动到旧头节点前面（最前面）
      // 最后把这个节点原来的位置的值设为 undefined -> 后面如果遍历到这个节点时需要移位
      if (idxInOld > -1) {
        const VNodeToMove = prevChildren[idxInOld];
        patch(VNodeToMove, newStartVNode, container);
        container.insertBefore(VNodeToMove.el, oldStartVNode.el);
        prevChildren[idxInOld] = undefined;
      } else {
        // 查找不到，说明是新增的节点，直接挂载到旧头节点的 DOM 前面
        mount(newStartVNode, container, false, oldStartVNode.el);
      }
      newStartVNode = nextChildren[++newStartIdx]; // 更新新头节点
    }
  }

  // 循环结束后 -> 先增后减
  // 比较旧头尾和新头尾的索引大小，哪个大小相反了说明这个数量少
  // 然后根据情况是新增节点还是删除节点
  // 新增节点 -> 旧头索引大于旧头尾索引时（旧节点数量比新节点少）
  if (oldStartIdx > oldEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mount(nextChildren[i], container, false, oldStartVNode.el);
    }
  }
  // 删除节点 -> 新尾索引比新头索引大（新节点数量比旧节点少）
  else if (newStartIdx > newEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      container.removeChild(prevChildren[i].el);
    }
  }
}

// Vue3 inferno Diff
export function advancedDiff(
  prevChildren,
  nextChildren,
  container,
  mount,
  patch
) {
  let j = 0;
  let prevVNode = prevChildren[j];
  let nextVNode = nextChildren[j];
  let prevEnd = prevChildren.length - 1;
  let nextEnd = nextChildren.length - 1;

  outer: {
    // 去相同前置 -> 向后遍历，直到 key 不同
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container);
      j++;
      if (j > prevEnd || j > nextEnd) break outer; // 性能优化
      prevVNode = prevChildren[j];
      nextVNode = nextChildren[j];
    }

    prevVNode = prevChildren[prevEnd];
    nextVNode = nextChildren[nextEnd];

    // 去相同后置 -> 向前遍历，直到 key 不同
    while (prevVNode.key === nextVNode.key) {
      patch(prevVNode, nextVNode, container);
      prevEnd--;
      nextEnd--;
      if (j > prevEnd || j > nextEnd) break outer; // 性能优化
      prevVNode = prevChildren[prevEnd];
      nextVNode = nextChildren[nextEnd];
    }
  }

  // 新增节点 -> j ~ nextEnd 之间的节点应该被添加
  if (j > prevEnd && j <= nextEnd) {
    const nextPos = nextEnd + 1;
    const refNode =
      nextPos < nextChildren.length ? nextChildren[nextPos].el : null;
    while (j <= nextEnd) {
      mount(nextChildren[j++], container, false, refNode);
    }
  }
  // 删除节点 -> j ~ prevEnd 之间的节点应该被删除
  else if (j > nextEnd) {
    while (j <= prevEnd) {
      container.removeChild(prevChildren[j++].el);
    }
  } else {
    const nextLeft = nextEnd - j + 1; // 新值未处理的节点数量
    const source = new Array(nextLeft).fill(-1); // 长度 nextLeft 填充 -1 的数组
    const prevStart = j;
    const nextStart = j;
    let moved = false;
    let lastIndex = 0; // 类似 react diff 的最大索引值

    let keyIndex = {}; // 新值 key 的索引映射表 key -> index

    for (let i = nextStart; i <= nextEnd; i++) {
      keyIndex[nextChildren[i].key] = i;
    }

    let patched = 0;

    // 遍历旧值
    for (let i = prevStart; i <= prevEnd; i++) {
      prevVNode = prevChildren[i];

      if (patched < nextLeft) {
        const k = keyIndex[prevVNode.key]; // 根据 key 查找它的索引
        if (typeof k !== "undefined") {
          nextVNode = nextChildren[k];
          patch(prevVNode, nextVNode, container);
          patched++;
          source[k - nextStart] = i; // 更新值，k - j 真正索引值
          if (k < lastIndex) {
            moved = true; // 需要移动节点
          } else {
            lastIndex = k;
          }
        } else {
          container.removeChild(prevVNode.el); // 没找到索引，删除节点
        }
      } else {
        container.removeChild(prevVNode.el); // 多余的节点，删除节点
      }
    }

    if (moved) {
      const seq = lis(source); // 最长增长子序列
      let l = seq.length - 1;

      // 从后面开始遍历
      for (let i = nextLeft - 1; i >= 0; i--) {
        // 新增节点，挂载到 nextPos 前面
        if (source[i] === -1) {
          const pos = i + nextStart;
          const nextVNode = nextChildren[pos];
          const nextPos = pos + 1;
          mount(
            nextVNode,
            container,
            false,
            nextPos < nextChildren.length ? nextChildren[nextPos].el : null
          );
        }
        // 移动节点，移动到 nextPos 前面
        else if (i !== seq[l]) {
          const pos = i + nextStart;
          const nextVNode = nextChildren[pos];
          const nextPos = pos + 1;
          container.insertBefore(
            nextVNode.el,
            nextPos < nextChildren.length ? nextChildren[nextPos].el : null
          );
        } else {
          l--;
        }
      }
    }
  }
}
