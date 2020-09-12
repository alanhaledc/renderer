import { Flags, ChildrenFlags } from "./flags";

// Fragment 是只有 children，没有标签和属性的片段
export const Fragment = Symbol("Fragment");

// Portal 是可以挂载在任意节点的 Fragment
export const Portal = Symbol("Portal");

export function createVNode(tag, data = null, children) {
  let flags = null;
  if (typeof tag === "string") {
    flags = Flags.ELEMENT;
  } else if (tag === Fragment) {
    flags = Flags.FRAGMENT;
  } else if (tag === Portal) {
    flags = Flags.PORTAL;
    tag = data && data.target;
  } else {
    if (tag !== null && typeof tag === "object") {
      flags = tags.functional
        ? Flags.FUNCTIONAL_COMPONENT
        : Flags.STATEFUL_COMPONENT;
    } else if (typeof tag === "function") {
      flags =
        tag.prototype && tag.prototype.render
          ? Flags.STATEFUL_COMPONENT
          : Flags.FUNCTIONAL_COMPONENT;
    }
  }

  let childrenFlags = null;
  if (Array.isArray(children)) {
    const { length } = children;
    if (length === 0) {
      childrenFlags = ChildrenFlags.NO_CHILDREN;
    } else if (length === 1) {
      childrenFlags = ChildrenFlags.SINGLE_CHILDREN;
      children = children[0];
    } else {
      childrenFlags = ChildrenFlags.MULTIPLE_CHILDREN;
      children = normalizeVNode(children);
    }
  } else if (children == null) {
    childrenFlags = ChildrenFlags.NO_CHILDREN;
  } else if (children._isVNode) {
    childrenFlags = ChildrenFlags.SINGLE_CHILDREN;
  } else {
    childrenFlags = ChildrenFlags.SINGLE_CHILDREN;
    children = createTextVNode(children + "");
  }

  return {
    _isVNode: true,
    tag,
    flags,
    data,
    key: data && data.key ? data.key : null,
    children,
    childrenFlags,
    el: null,
  };
}

function normalizeVNode(children) {
  const newChildren = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.key == null) {
      child.key = "|" + i;
    }
    newChildren.push(child);
  }
  return newChildren;
}

export function createTextVNode(text) {
  return {
    _isVNode: true,
    tag: null,
    flags: Flags.TEXT,
    data: null,
    children: text,
    childrenFlags: ChildrenFlags.NO_CHILDREN,
  };
}
