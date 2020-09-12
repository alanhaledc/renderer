function render(vnode, container) {
  if (typeof vnode.tag === "string") {
    mountElement(vnode, container);
  } else {
    mountComponent(vnode, container);
  }
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.tag);
  container.appendChild(el);
}

function mountComponent(vnode, container) {
  const instance = new vnode.tag();
  instance.$vnode = instance.render();
  mountElement(instance.$vnode, container);
}

render({ tag: "h1" }, document.getElementById("app")); // 挂载元素

class MyComponent {
  render() {
    return {
      tag: "h2",
    };
  }
}

const componentVnode = {
  tag: MyComponent,
};

// render(componentVnode, document.getElementById('app')) // 挂载组件
