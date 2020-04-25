import { createVNode as h, Portal, Fragment } from './vnode'
import render from './render'

const prevVNode = h('div', { style: { color: 'red' } }, [
  h('p', { key: 'a' }, 'old 1'),
  h('p', { key: 'b' }, 'old 2'),
  h('p', { key: 'c' }, 'old 3'),
  h('p', { key: 'd' }, 'old 4'),
  h('p', { key: 'g' }, 'old 8'),
])

const nextVNode = h('div', { style: { color: 'blue' } }, [
  h('p', { key: 'c' }, 'new 3'),
  h('p', { key: 'a' }, 'new 1'),
  h('p', { key: 'b' }, 'new 2'),
  h('p', { key: 'd' }, 'new 14'),
  h('p', { key: 'f' }, 'new 15'),
  h('p', { key: 'h' }, 'new 22'),
])

render(prevVNode, document.getElementById('app'))

setTimeout(() => {
  render(nextVNode, document.getElementById('app'))
}, 2000)
