/*
 * @Author: Hale
 * @Description: render demo
 * @Date: 2019/10/18
 * @LastEditTime: 2019/10/20
 */

import { h, Portal, Fragment } from './h'
import render from './render'

const prevVNode = h('div', null, [
  h('p', { key: 'a' }, 'old 1'),
  h('p', { key: 'b' }, 'old 2'),
  h('p', { key: 'c' }, 'old 3'),
  h('p', { key: 'd' }, 'old 4'),
  h('p', { key: 'f' }, 'old 6'),
  h('p', { key: 'h' }, 'old 8'),
  h('p', { key: 'e' }, 'old 5')
])

const nextVNode = h('div', null, [
  h('p', { key: 'a' }, 'new 1'),
  h('p', { key: 'c' }, 'new 3'),
  h('p', { key: 'd' }, 'new 4'),
  h('p', { key: 'b' }, 'new 2'),
  h('p', { key: 'g' }, 'new 7'),
  h('p', { key: 'e' }, 'new 5')
])

render(prevVNode, document.getElementById('app'))

setTimeout(() => {
  render(nextVNode, document.getElementById('app'))
}, 2000)
