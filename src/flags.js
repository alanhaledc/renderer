const Flags = {
  ELEMENT: 1,
  FUNCTIONAL_COMPONENT: 1 << 1,
  STATEFUL_COMPONENT: 1 << 2,
  TEXT: 1 << 3,
  FRAGMENT: 1 << 4,
  PORTAL: 1 << 5,
};

Flags.COMPONENT = Flags.FUNCTIONAL_COMPONENT | Flags.STATEFUL_COMPONENT;

const ChildrenFlags = {
  NO_CHILDREN: 1,
  SINGLE_CHILDREN: 1 << 1,
  MULTIPLE_CHILDREN: 1 << 2,
};

export { Flags, ChildrenFlags };
