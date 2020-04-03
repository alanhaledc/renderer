# renderer 渲染器

这是一个 renderer 渲染器。

根据 HcySunYang 最新的[vue-design](https://github.com/HcySunYang/vue-design)库编写的代码，使用 Webpack 搭建环境。

对于学习 Virtual DOM 和 diff 算法以及 Vue 、React 源码很有帮助。

## 说明

- 设计虚拟节点对象，除了`tag`、`data`、`children`等基本属性外，还有优化的`flags`、`key`、`childrenFlags`等属性

- 挂载 `mount`，不存在旧节点时（第一次挂载时）

  - 挂载元素 `mountElement`，创建 DOM，并存储到`el`属性中

    - 创建数据`data`
    - 多个子节点遍历挂载到`el`中

  - 挂载组件`mountComponent`

    - 挂载状态组件`mountStatefulComponent`，创建实例，然后实例的`render`生成虚拟节点，并执行`mounted`生命周期方法
    - 挂载函数组件`mountFunctionalComponent`，传入参数，并指向函数生成虚拟节点

  - 挂载文本 `mountText`，创建文本节点，并存储到`el`属性中

  - 挂载片段 `mountFragment`，Fragment 是只有 children，没有标签和属性的片段

    - 没有子节点，创建占位的空文本节点，并把这个节点的`el`存储到节点的 `el`属性中
    - 只有一个子节点，把该子节点的`el`存储到节点的`el`属性中
    - 多个子节点，把第一个子节点的`el`存储到节点的`el`属性中

  - 挂载 Portal `mountPortal`，Portal 是可以挂载在任意节点的 Fragment，可以挂载到目标节点中

- 补丁 `patch`，存在旧节点时

  - 替换节点

    - 类型`flags`不一样
    - 标签`tag`不一样

  - patch 元素 `patchElement`

    - patch 数据 `patchData`，不同的数据不同的策略
    - patch 子节点 `patchChildren`
      - 只有新旧子节点都是多个时（多对多）才使用 **Diff 算法**

  - patch 组件 `patchComponent`

    - 状态组件`mountStatefulComponent`，再次执行实例的`render`方法更新值，并替换掉原来的值，并执行`update`生命周期方法
    - 函数组件`mountFunctionalComponent`，重新执行函数更新值，并替换掉原来的值。

  - patch 文本 `patchText`，只更新节点的`nodeValue`即可。

  - patch 片段 `patchFragment`，先更新子节点，再更新`el`属性

  - patch Portal `patchPortal`，先更新子节点，再更新`el`属性。如果新旧节点不同，还需要移动子节点的 DOM
