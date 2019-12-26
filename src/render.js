/*
 * @Author: Hale
 * @Description: render 函数，通过 VNode 生成真实 DOM
 * @Date: 2019/10/19
 * @LastEditTime : 2019/12/26
 */

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
