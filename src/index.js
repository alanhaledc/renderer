import { createVNode as h, Portal, Fragment } from './vnode'
import render from './render'

const prevVNode = h('div', { style: { color: 'red' } }, [
  h('p', { key: 'a' }, 'old 1'),
  h('p', { key: 'b' }, 'old 2'),
  h('p', { key: 'c' }, 'old 3'),
])

const nextVNode = h('div', { style: { color: 'blue' } }, [
  h('p', { key: 'c' }, 'new 3'),
  h('p', { key: 'a' }, 'new 1'),
  h('p', { key: 'b' }, 'new 2'),
])

render(prevVNode, document.getElementById('app'))

setTimeout(() => {
  render(nextVNode, document.getElementById('app'))
}, 2000)
