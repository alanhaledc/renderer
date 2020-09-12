import { init } from "snabbdom/init";
import { h } from "snabbdom/h";

const patch = init([]);

function myComponent(props) {
  return h("h1", props.title);
}

const prevVnode = myComponent({
  title: "hello prev",
});

patch(document.getElementById("app"), prevVnode);

const nextVnode = myComponent({
  title: "hello next",
});

patch(prevVnode, nextVnode);
