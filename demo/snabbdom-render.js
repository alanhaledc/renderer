/*
 * @Author: Hale
 * @Description: snabbdom 渲染组件
 * @Date: 2019/10/18
 * @LastEditTime: 2019/10/19
 */

import { h, init } from 'snabbdom'

const patch = init([])

function myComponent(props) {
  return h('h1', props.title)
}

const prevVnode = myComponent({
  title: 'hello prev'
})

patch(document.getElementById('app'), prevVnode)

const nextVnode = myComponent({
  title: 'hello next'
})

patch(prevVnode, nextVnode)
