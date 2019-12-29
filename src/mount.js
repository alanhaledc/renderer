/*
 * @Author: Hale
 * @Description: mount 函数，生成全新的 DOM
 * @Date: 2019/10/20
 * @LastEditTime : 2019/12/27
 */

import { Flags, ChildrenFlags } from './flags'
import patch, { patchData } from './patch'
import { domPromsRE } from './util'
import { createTextVNode } from './vnode'

export default function mount(vnode, container, isSVG, refNode) {
  const { flags } = vnode
  if (flags & Flags.ELEMENT) {
    mountElement(vnode, container, isSVG, refNode)
  } else if (flags & Flags.COMPONENT) {
    mountComponent(vnode, container, isSVG)
  } else if (flags & Flags.TEXT) {
    mountText(vnode, container)
  } else if (flags & Flags.FRAGMENT) {
    mountFragment(vnode, container, isSVG)
  } else if (flags & Flags.PORTAL) {
    mountPortal(vnode, container, isSVG)
  }
}

function mountElement(vnode, container, isSVG, refNode) {
  const { tag, data, children, childrenFlags } = vnode
  isSVG = isSVG || tag === 'svg'
  const el = isSVG
    ? document.createAttributeNS('http://www.w3.org/2000/svg', vnode.tag)
    : document.createElement(vnode.tag)
  vnode.el = el
  if (data) {
    for (let key in data) {
      patchData(el, key, null, data[key]) // 没有 prevValue 则创建属性
    }
  }
  if (childrenFlags & ChildrenFlags.SINGLE_CHILDREN) {
    mount(children, el, isSVG)
  } else if (childrenFlags & ChildrenFlags.MULTIPLE_CHILDREN) {
    for (let i = 0; i < children.length; i++) {
      mount(children[i], el, isSVG)
    }
  }
  refNode ? container.insertBefore(el, refNode) : container.appendChild(el)
}

function mountText(vnode, container) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.appendChild(el)
}

function mountFragment(vnode, container, isSVG) {
  const { children, childrenFlags } = vnode

  // 注意每种情况的 el 都不一样
  switch (childrenFlags) {
    case ChildrenFlags.NO_CHILDREN:
      const placeholder = createTextVNode('') // 创建占位的空文本节点
      mountText(placeholder, container)
      vnode.el = placeholder.el
      break
    case ChildrenFlags.SINGLE_CHILDREN:
      mount(children, container, isSVG)
      vnode.el = children.el
      break
    default:
      for (let i = 0; i < children.length; i++) {
        mount(children[i], container, isSVG)
      }
      vnode.el = children[0].el
  }
}

function mountPortal(vnode, container, isSVG) {
  const { tag, children, childrenFlags } = vnode
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag // 挂载的目标元素
  if (childrenFlags & ChildrenFlags.SINGLE_CHILDREN) {
    mount(children, target, isSVG)
  } else if (childrenFlags & ChildrenFlags.MULTIPLE_CHILDREN) {
    for (let i = 0; i < children.length; i++) {
      mount(children[i], target, isSVG)
    }
  }

  const placeholder = createTextVNode('')
  mountText(placeholder, container) // 原来的 container 挂载一个空的文本节点
  vnode.el = placeholder.el
}

function mountComponent(vnode, container, isSVG) {
  if (vnode.flags & Flags.STATEFUL_COMPONENT) {
    mountStatefulComponent(vnode, container, isSVG)
  } else {
    mountFunctionalComponent(vnode, container, isSVG)
  }
}

function mountStatefulComponent(vnode, container, isSVG) {
  const instance = (vnode.children = new vnode.tag()) // 组件实例存储在 children 中
  instance.$props = vnode.data

  instance._update = function() {
    // patch
    if (instance._mounted) {
      const prevVNode = instance.$vnode // 缓存旧的 VNode
      const nextVNode = (instance.$vnode = instance.render()) // 生成新的 VNode 并替换掉旧的
      patch(prevVNode, nextVNode, prevVNode.el.parentNode) // 挂载到旧的父节点上
      instance.$el = vnode.el = instance.$vnode.el
    } else {
      const $vnode = (instance.$vnode = instance.render()) // render 生成一个 VNode
      mount($vnode, container, isSVG)
      instance._mounted = true
      instance.$el = vnode.el = instance.$vnode.el
      instance.mounted && instance.mounted() // 执行挂载函数
    }
  }
  instance._update()
}

function mountFunctionalComponent(vnode, container, isSVG) {
  vnode.handle = {
    prev: null,
    next: vnode,
    container,
    update: () => {
      // patch
      if (vnode.handle.prev) {
        const prevVNode = vnode.handle.prev // 旧的 VNode -> patch 时更新
        const nextVNode = vnode.handle.next // 新的 VNode
        const prevTree = prevVNode.children // 旧的函数返回值
        const props = nextVNode.data
        const nextTree = (nextVNode.children = nextVNode.tag(props)) // 新的函数返回值，并替换掉旧的
        patch(prevTree, nextTree, vnode.handle.container)
      } else {
        const props = vnode.data // 这里暂时将 data 的值都当成 props
        const $vnode = (vnode.children = vnode.tag(props)) // 函数返回值（生成一个 VNode）并存储在 children 中
        mount($vnode, container, isSVG)
        vnode.el = $vnode.el
      }
    }
  }
  vnode.handle.update()
}
