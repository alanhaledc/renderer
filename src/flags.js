/*
 * @Author: Hale
 * @Description: VNode 标识和 children 标识
 * @Date: 2019/10/19
 * @LastEditTime: 2019/10/20
 */

const VNodeFlags = {
  ELEMENT_HTML: 1,
  ELEMENT_SVG: 1 << 1, // 2
  COMPONENT_STATEFUL_NORMAL: 1 << 2, // 4
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3, // 8
  COMPONENT_STATEFUL_KEEP_ALIVE: 1 << 4, // 16
  COMPONENT_FUNCTIONAL: 1 << 5, // 32
  TEXT: 1 << 6, // 64
  FRAGMENT: 1 << 7, // 128
  PORTAL: 1 << 8 // 256
}

VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG

VNodeFlags.COMPONENT_STATEFUL =
  VNodeFlags.COMPONENT_STATEFUL_NORMAL |
  VNodeFlags.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE |
  VNodeFlags.COMPONENT_STATEFUL_KEEP_ALIVE

VNodeFlags.COMPONENT =
  VNodeFlags.COMPONENT_STATEFUL | VNodeFlags.COMPONENT_FUNCTIONAL

const ChildrenFlags = {
  UNKNOWN_CHILDREN: 0,
  NO_CHILDREN: 1,
  SINGLE_VNODE: 1 << 1, // 2
  KEYED_VNODES: 1 << 2, // 4
  NONE_KEYED_VNODES: 1 << 3 // 8
}

ChildrenFlags.MUTIPLE_VNODES =
  ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES

export { VNodeFlags, ChildrenFlags }
