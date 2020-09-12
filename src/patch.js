import { Flags, ChildrenFlags } from "./flags";
import mount from "./mount";
import { domPromsRE, isPlainObj } from "./util";
import { doubleSideDiff as diff } from "./diff";

export default function patch(prevVNode, nextVNode, container) {
  const nextFlags = nextVNode.flags;
  const prevFlags = prevVNode.flags;

  if (prevFlags !== nextFlags) {
    replaceVNode(prevVNode, nextVNode, container);
  } else if (nextFlags & Flags.ELEMENT) {
    patchElement(prevVNode, nextVNode, container);
  } else if (nextFlags & Flags.COMPONENT) {
    patchComponent(prevVNode, nextVNode, container);
  } else if (nextFlags & Flags.TEXT) {
    patchText(prevVNode, nextVNode);
  } else if (nextFlags & Flags.FRAGMENT) {
    patchFragment(prevVNode, nextVNode, container);
  } else if (nextFlags & Flags.PORTAL) {
    patchPortal(prevVNode, nextVNode);
  }
}

function replaceVNode(prevVNode, nextVNode, container) {
  container.removeChild(prevVNode.el);
  if (prevVNode.flags & Flags.STATEFUL_COMPONENT) {
    const instance = prevVNode.children;
    instance.unmounted && instance.unmounted(); // 执行 unmounted 生命周期函数
  }
  mount(nextVNode, container);
}

function patchElement(prevVNode, nextVNode, container) {
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
    return;
  }

  const el = (nextVNode.el = prevVNode.el); // el 不变，为同一个引用
  const prevData = prevVNode.data;
  const nextData = nextVNode.data;

  if (nextData) {
    for (let key in nextData) {
      const prevValue = prevData[key];
      const nextValue = nextData[key];
      patchData(el, key, prevValue, nextValue);
    }
  }

  if (prevData) {
    for (let key in prevData) {
      const prevValue = prevData[key];
      if (prevValue && !nextData.hasOwnProperty(key)) {
        patchData(el, key, prevValue, null);
      }
    }
  }

  patchChildren(
    prevVNode.childrenFlags,
    nextVNode.childrenFlags,
    prevVNode.children,
    nextVNode.children,
    el
  );
}

export function patchData(el, key, prevValue, nextValue) {
  switch (key) {
    case "style":
      for (let k in nextValue) {
        el.style[k] = nextValue[k];
      }
      for (let k in prevValue) {
        if (!nextValue.hasOwnProperty(k)) {
          el.style[k] = "";
        }
      }
      break;
    case "class":
      let res = "";
      if (typeof nextValue === "string") {
        res = nextValue;
      } else if (Array.isArray(nextValue)) {
        for (let i = 0; i < nextValue.length; i++) {
          res += nextValue[i] + " ";
        }
      } else if (isPlainObj(nextValue)) {
        for (let name in nextValue) {
          if (nextValue[name]) {
            res += name + " ";
          }
        }
      }
      if (isSVG) {
        el.setAttribute("class", res.trim());
      } else {
        el.className = res.trim();
      }
      break;
    default:
      if (key[0] === "o" && key[1] === "n") {
        if (prevValue) {
          el.removeEventListener(key.slice(2), prevValue);
        }
        if (nextValue) {
          el.addEventListener(key.slice(2), nextValue);
        }
      } else if (domPromsRE.test(key)) {
        el[key] = nextValue;
      } else {
        el.setAttribute(key, nextValue);
      }
  }
}

function patchChildren(
  prevChildrenFlags,
  nextChildrenFlags,
  prevChildren,
  nextChildren,
  container
) {
  switch (prevChildrenFlags) {
    case ChildrenFlags.NO_CHILDREN:
      switch (nextChildrenFlags) {
        case ChildrenFlags.NO_CHILDREN:
          break;
        case ChildrenFlags.SINGLE_CHILDREN:
          mount(nextChildren, container);
          break;
        default:
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container);
          }
      }
      break;
    case ChildrenFlags.SINGLE_CHILDREN:
      switch (nextChildrenFlags) {
        case ChildrenFlags.NO_CHILDREN:
          container.removeChild(prevChildren.el);
          break;
        case ChildrenFlags.SINGLE_CHILDREN:
          patch(prevChildren, nextChildren, container);
          break;
        default:
          container.removeChild(prevChildren.el);
          for (let i = 0; i < nextChildren.length; i++) {
            mount(nextChildren[i], container);
          }
      }
      break;
    // case ChildrenFlags.MULTIPLE_CHILDREN
    default:
      switch (nextChildrenFlags) {
        case ChildrenFlags.NO_CHILDREN:
          for (let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el);
          }
          break;
        case ChildrenFlags.SINGLE_CHILDREN:
          for (let i = 0; i < prevChildren.length; i++) {
            container.removeChild(prevChildren[i].el);
          }
          mount(nextChildren, container);
          break;
        default:
          // MULTIPLE_CHILDREN => MULTIPLE_CHILDREN
          // 这里才需要使用 Diff 算法，尽可能的复用节点
          diff(prevChildren, nextChildren, container, mount, patch);
      }
  }
}

function patchText(prevVNode, nextVNode) {
  const el = (nextVNode.el = prevVNode.el); // el 不变，同一个引用
  if (nextVNode.children !== prevVNode.children) {
    el.nodeValue = nextVNode.children;
  }
}

function patchFragment(prevVNode, nextVNode, container) {
  // 先 patch children
  patchChildren(
    prevVNode.childrenFlags,
    nextVNode.childrenFlags,
    prevVNode.children,
    nextVNode.children,
    container
  );

  // 再更新 el
  switch (nextVNode.childrenFlags) {
    case ChildrenFlags.NO_CHILDREN:
      nextVNode.el = prevVNode.el;
    case ChildrenFlags.SINGLE_CHILDREN:
      nextVNode.el = nextVNode.children.el;
      break;
    default:
      nextVNode.el = nextVNode.children[0].el; // 存储第一个 Vnode 的 el
      break;
  }
}

function patchPortal(prevVNode, nextVNode) {
  // patch children
  patchChildren(
    prevVNode.childrenFlags,
    nextVNode.childrenFlags,
    prevVNode.children,
    nextVNode.children,
    prevVNode.tag // target
  );

  // 更新 el
  nextVNode.el = prevVNode.el;

  // 新旧节点不同，需要移动子节点
  if (nextVNode.tag !== prevVNode.tag) {
    const container =
      typeof nextVNode.tag === "string"
        ? document.querySelector(nextVNode.tag)
        : nextVNode.tag;

    switch (nextVNode.childrenFlags) {
      case ChildrenFlags.NO_CHILDREN:
        break;
      case ChildrenFlags.SINGLE_CHILDREN:
        container.appendChild(nextVNode.children.el);
        break;
      default:
        for (let i = 0; i < nextVNode.children.length; i++) {
          container.appendChild(nextVNode.children[i].el);
        }
    }
  }
}

function patchComponent(prevVNode, nextVNode, container) {
  if (nextVNode.tag !== prevVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
  } else if (nextVNode.flags & Flags.STATEFUL_COMPONENT) {
    const instance = (nextVNode.children = prevVNode.children);
    instance.$props = nextVNode.data;
    instance._update();
  } else {
    const handle = (nextVNode.handle = prevVNode.handle);
    handle.prev = prevVNode;
    handle.next = nextVNode;
    handle.container = container;
    handle.update();
  }
}
