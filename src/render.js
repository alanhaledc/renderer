import { Flags, ChildrenFlags } from './flags'
import { createTextVNode } from './vnode'
import mount from './mount'
import patch from './patch'

export default function render(vnode, container) {
  const prevVNode = container.vnode
  if (prevVNode == null) {
    if (vnode) {
      mount(vnode, container)
    }
    container.vnode = vnode
  } else {
    if (vnode) {
      patch(prevVNode, vnode, container)
      container.vnode = vnode
    } else {
      container.removeChild(prevVNode.el)
      container.vnode = null
    }
  }
}
