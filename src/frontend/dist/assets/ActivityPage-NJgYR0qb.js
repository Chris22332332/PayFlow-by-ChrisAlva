import { r as reactExports, j as jsxRuntimeExports, aE as shimExports, aF as Primitive, aB as useCallbackRef, aC as useLayoutEffect2, an as cn, aG as useQuery, aH as useQueryClient, aI as useMutation, aJ as useActivityFeed, B as Button, ae as RefreshCw, aK as Activity, aL as Globe, aM as Star, p as Card, q as CardContent, aN as Tabs, aO as TabsList, aP as TabsTrigger, U as Users, w as Badge, aQ as TabsContent, aR as Search, K as Input, S as Skeleton, m as motion, a7 as AnimatePresence, z as Plus, aS as useAddReaction, aT as useRemoveReaction, aU as useTogglePaymentVisibility, s as ArrowUpRight, A as ArrowDownLeft, aV as formatCurrencyDisplay, L as Lock, af as useNavigate, aW as Phone, aX as Send, ad as Trash2, aY as X, E as Dialog, Y as DialogContent, _ as DialogHeader, $ as DialogTitle, a0 as Label, a1 as Select, a2 as SelectTrigger, a3 as SelectValue, a4 as SelectContent, a5 as SelectItem, au as Gift, o as TrendingUp, aZ as User, a_ as Shield, a$ as Eye } from "./index-BQXzav6B.js";
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = reactExports.createContext(defaultContext);
    BaseContext.displayName = rootComponentName + "Context";
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      var _a;
      const { scope, children, ...context } = props;
      const Context = ((_a = scope == null ? void 0 : scope[scopeName]) == null ? void 0 : _a[index]) || BaseContext;
      const value = reactExports.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      var _a;
      const Context = ((_a = scope == null ? void 0 : scope[scopeName]) == null ? void 0 : _a[index]) || BaseContext;
      const context = reactExports.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return reactExports.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = (scope == null ? void 0 : scope[scopeName]) || scopeContexts;
      return reactExports.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return reactExports.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
function useIsHydrated() {
  return shimExports.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
function subscribe() {
  return () => {
  };
}
var AVATAR_NAME = "Avatar";
var [createAvatarContext] = createContextScope(AVATAR_NAME);
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = reactExports.useState("idle");
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar$1.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {
    }, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src, imageProps);
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });
    useLayoutEffect2(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = reactExports.useState(delayMs === void 0);
    reactExports.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback$1.displayName = FALLBACK_NAME;
function resolveLoadingStatus(image, src) {
  if (!image) {
    return "idle";
  }
  if (!src) {
    return "error";
  }
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalWidth > 0 ? "loaded" : "loading";
}
function useImageLoadingStatus(src, { referrerPolicy, crossOrigin }) {
  const isHydrated = useIsHydrated();
  const imageRef = reactExports.useRef(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();
  const [loadingStatus, setLoadingStatus] = reactExports.useState(
    () => resolveLoadingStatus(image, src)
  );
  useLayoutEffect2(() => {
    setLoadingStatus(resolveLoadingStatus(image, src));
  }, [image, src]);
  useLayoutEffect2(() => {
    const updateStatus = (status) => () => {
      setLoadingStatus(status);
    };
    if (!image) return;
    const handleLoad = updateStatus("loaded");
    const handleError = updateStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    if (typeof crossOrigin === "string") {
      image.crossOrigin = crossOrigin;
    }
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [image, crossOrigin, referrerPolicy]);
  return loadingStatus;
}
var Root = Avatar$1;
var Fallback = AvatarFallback$1;
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "avatar",
      className: cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      ),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
      ...props
    }
  );
}
const CONTACTS_KEY = "payflow_trusted_contacts_v2";
function genId() {
  return `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function loadContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  const seed = [
    {
      id: genId(),
      name: "Alex Chen",
      username: "alexchen",
      email: "alex@example.com",
      phone: "+1 555-0101",
      relationship: "Colleague",
      accessLevel: "Full",
      addedAt: Date.now() - 1e3 * 60 * 60 * 24 * 90,
      lastTransactionAt: Date.now() - 1e3 * 60 * 60 * 2,
      notes: "Work colleague — frequent lunch splits"
    },
    {
      id: genId(),
      name: "Sarah Kim",
      username: "sarah_k",
      phone: "+1 555-0102",
      relationship: "Friend",
      accessLevel: "Full",
      addedAt: Date.now() - 1e3 * 60 * 60 * 24 * 45,
      lastTransactionAt: Date.now() - 1e3 * 60 * 60 * 24,
      notes: "Roommate"
    },
    {
      id: genId(),
      name: "Marcus Johnson",
      username: "marcusj",
      email: "marcus@example.com",
      relationship: "Friend",
      accessLevel: "View-only",
      addedAt: Date.now() - 1e3 * 60 * 60 * 24 * 10,
      lastTransactionAt: Date.now() - 1e3 * 60 * 60 * 24 * 3,
      notes: "College friend"
    },
    {
      id: genId(),
      name: "Mom",
      phone: "+1 555-0103",
      relationship: "Family",
      accessLevel: "Emergency",
      addedAt: Date.now() - 1e3 * 60 * 60 * 24 * 180,
      notes: "Emergency contact"
    },
    {
      id: genId(),
      name: "Jordan Rivera",
      username: "jrivera",
      email: "jordan@example.com",
      relationship: "Friend",
      accessLevel: "Full",
      addedAt: Date.now() - 1e3 * 60 * 60 * 24 * 25,
      lastTransactionAt: Date.now() - 1e3 * 60 * 60 * 8,
      notes: "Gym buddy"
    }
  ];
  saveContacts(seed);
  return seed;
}
function saveContacts(contacts) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}
function useTrustedContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: () => loadContacts()
  });
}
function useAddTrustedContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      const contacts = loadContacts();
      const newContact = {
        ...input,
        id: genId(),
        addedAt: Date.now()
      };
      saveContacts([...contacts, newContact]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] })
  });
}
function useRemoveTrustedContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contactId) => {
      const contacts = loadContacts();
      saveContacts(contacts.filter((c) => c.id !== contactId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] })
  });
}
function timeAgo(ms) {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 6e4);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}
function getInitials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function getAvatarColor(name) {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-accent/20 text-accent-foreground",
    "bg-destructive/20 text-destructive",
    "bg-chart-1/20",
    "bg-chart-2/20",
    "bg-chart-3/20"
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}
function matchesFilter(item, filter) {
  if (filter === "all") return true;
  if (filter === "sent")
    return item.type === "payment" && item.title.toLowerCase().startsWith("you sent");
  if (filter === "received")
    return item.type === "payment" && !item.title.toLowerCase().startsWith("you sent");
  if (filter === "goals")
    return item.type === "savings_deposit" || item.type === "savings_withdraw";
  if (filter === "achievements")
    return item.type === "referral" || item.type === "subscription";
  return true;
}
function getTypeIcon(type) {
  switch (type) {
    case "savings_deposit":
    case "savings_withdraw":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-primary" });
    case "referral":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4 text-accent-foreground" });
    case "subscription":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-primary" });
    default:
      return null;
  }
}
function ActivityCard({
  item,
  index
}) {
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const toggleVisibility = useTogglePaymentVisibility();
  const isSent = item.type === "payment" && item.title.toLowerCase().startsWith("you sent");
  const isPayment = item.type === "payment";
  const counterpartyInitials = item.counterpartyName ? getInitials(item.counterpartyName) : "?";
  const avatarColor = item.counterpartyName ? getAvatarColor(item.counterpartyName) : "bg-muted text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.22, delay: index * 0.03 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: cn(
            "overflow-hidden transition-all duration-200 hover:shadow-md",
            !item.isPublic && "border-dashed"
          ),
          "data-ocid": `activity.item.${index}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-10 w-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                AvatarFallback,
                {
                  className: cn("text-sm font-semibold", avatarColor),
                  children: isPayment ? counterpartyInitials : getTypeIcon(item.type)
                }
              ) }),
              isPayment && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center",
                    isSent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  ),
                  children: isSent ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-2.5 w-2.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "h-2.5 w-2.5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold leading-tight truncate", children: item.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 line-clamp-2", children: item.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 ml-2", children: [
                  item.amountCents != null && item.currency && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "p",
                    {
                      className: cn(
                        "text-sm font-bold tabular-nums",
                        isSent ? "text-destructive" : "text-primary"
                      ),
                      children: [
                        isSent ? "−" : "+",
                        formatCurrencyDisplay(
                          item.amountCents,
                          item.currency
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: timeAgo(item.timestamp) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => toggleVisibility.mutate({
                    activityId: item.id,
                    isPublic: !item.isPublic
                  }),
                  className: cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors",
                    item.isPublic ? "border-border text-muted-foreground hover:border-primary/40 hover:text-primary" : "border-dashed border-border text-muted-foreground hover:text-foreground"
                  ),
                  "data-ocid": "activity.visibility_toggle",
                  children: item.isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Public" })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Private" })
                  ] })
                }
              ) }),
              item.reactions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 mt-3 flex-wrap", children: item.reactions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (r.reacted) {
                      removeReaction.mutate({
                        activityId: item.id,
                        emoji: r.emoji
                      });
                    } else {
                      addReaction.mutate({
                        activityId: item.id,
                        emoji: r.emoji
                      });
                    }
                  },
                  className: cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 select-none",
                    r.reacted ? "bg-primary/10 border-primary/40 text-primary scale-105" : "bg-muted/50 border-border text-foreground hover:border-primary/30 hover:bg-primary/5",
                    r.count === 0 && !r.reacted && "opacity-50"
                  ),
                  "data-ocid": `activity.reaction.${r.emoji}.${index}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.emoji }),
                    r.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums font-medium", children: r.count })
                  ]
                },
                r.emoji
              )) })
            ] })
          ] }) })
        }
      )
    }
  );
}
function AddContactModal({ open, onClose }) {
  const addContact = useAddTrustedContact();
  const [form, setForm] = reactExports.useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    relationship: "Friend",
    accessLevel: "View-only",
    notes: ""
  });
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addContact.mutate(
      {
        name: form.name,
        username: form.username || void 0,
        phone: form.phone || void 0,
        email: form.email || void 0,
        relationship: form.relationship,
        accessLevel: form.accessLevel,
        notes: form.notes || void 0
      },
      {
        onSuccess: () => {
          onClose();
          setForm({
            name: "",
            username: "",
            phone: "",
            email: "",
            relationship: "Friend",
            accessLevel: "View-only",
            notes: ""
          });
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-md",
      "data-ocid": "contacts.add_contact.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Trusted Contact" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contact-name", children: "Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "contact-name",
                placeholder: "e.g. Alex Chen",
                value: form.name,
                onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
                required: true,
                "data-ocid": "contacts.add_contact.name_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contact-username", children: "Username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "contact-username",
                  placeholder: "@username",
                  value: form.username,
                  onChange: (e) => setForm((f) => ({ ...f, username: e.target.value })),
                  "data-ocid": "contacts.add_contact.username_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contact-phone", children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "contact-phone",
                  type: "tel",
                  placeholder: "+1 555-0100",
                  value: form.phone,
                  onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })),
                  "data-ocid": "contacts.add_contact.phone_input"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contact-email", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "contact-email",
                type: "email",
                placeholder: "email@example.com",
                value: form.email,
                onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })),
                "data-ocid": "contacts.add_contact.email_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relationship" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.relationship,
                  onValueChange: (v) => setForm((f) => ({
                    ...f,
                    relationship: v
                  })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "contacts.add_contact.relationship_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [
                      "Family",
                      "Friend",
                      "Colleague",
                      "Other"
                    ].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.accessLevel,
                  onValueChange: (v) => setForm((f) => ({
                    ...f,
                    accessLevel: v
                  })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "contacts.add_contact.access_level_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["View-only", "Emergency", "Full"].map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a }, a)) })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contact-notes", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "contact-notes",
                placeholder: "e.g. Roommate, best friend...",
                value: form.notes,
                onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
                "data-ocid": "contacts.add_contact.notes_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "flex-1",
                onClick: onClose,
                "data-ocid": "contacts.add_contact.cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                className: "flex-1",
                disabled: addContact.isPending,
                "data-ocid": "contacts.add_contact.submit_button",
                children: addContact.isPending ? "Adding..." : "Add Contact"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
const REL_COLORS = {
  Family: "bg-destructive/10 text-destructive border-destructive/20",
  Friend: "bg-primary/10 text-primary border-primary/20",
  Colleague: "bg-accent/10 text-accent-foreground border-accent/20",
  Other: "bg-muted text-muted-foreground border-border"
};
const ACCESS_ICONS = {
  "View-only": /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
  Emergency: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
  Full: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" })
};
function ContactCard({
  contact,
  index
}) {
  const remove = useRemoveTrustedContact();
  const [confirmDelete, setConfirmDelete] = reactExports.useState(false);
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { duration: 0.2, delay: index * 0.04 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "overflow-hidden hover:shadow-md transition-all duration-200",
          "data-ocid": `contacts.item.${index}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-11 w-11 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                AvatarFallback,
                {
                  className: cn(
                    "text-sm font-semibold",
                    getAvatarColor(contact.name)
                  ),
                  children: getInitials(contact.name)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: contact.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: "outline",
                      className: cn(
                        "text-xs px-2 py-0 h-5",
                        REL_COLORS[contact.relationship] ?? REL_COLORS.Other
                      ),
                      children: contact.relationship
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 flex-wrap", children: [
                  contact.username && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "@",
                    contact.username
                  ] }),
                  contact.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                    contact.phone
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: cn(
                        "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                        contact.accessLevel === "Full" ? "bg-primary/10 text-primary border-primary/20" : contact.accessLevel === "Emergency" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground border-border"
                      ),
                      children: [
                        ACCESS_ICONS[contact.accessLevel],
                        contact.accessLevel
                      ]
                    }
                  ),
                  contact.lastTransactionAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "Last sent ",
                    timeAgo(contact.lastTransactionAt)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-8 gap-1.5 text-xs",
                    "data-ocid": `contacts.send_button.${index}`,
                    onClick: () => {
                      const recipient = contact.email ?? contact.phone ?? contact.name;
                      void navigate({ to: "/", search: { send: recipient } });
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
                      "Send"
                    ]
                  }
                ),
                confirmDelete ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "destructive",
                      className: "h-8 w-8 p-0",
                      onClick: () => remove.mutate(contact.id),
                      "data-ocid": `contacts.confirm_delete.${index}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      className: "h-8 w-8 p-0",
                      onClick: () => setConfirmDelete(false),
                      "data-ocid": `contacts.cancel_delete.${index}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-8 w-8 p-0 text-muted-foreground hover:text-destructive",
                    onClick: () => setConfirmDelete(true),
                    "data-ocid": `contacts.delete_button.${index}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] })
            ] }),
            contact.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 pl-14 italic", children: contact.notes })
          ] })
        }
      )
    }
  );
}
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Received", value: "received" },
  { label: "Goals", value: "goals" },
  { label: "Achievements", value: "achievements" }
];
function ActivityPage() {
  const {
    data: feed = [],
    isLoading: feedLoading,
    refetch
  } = useActivityFeed();
  const { data: contacts = [], isLoading: contactsLoading } = useTrustedContacts();
  const [activeFilter, setActiveFilter] = reactExports.useState("all");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showAddContact, setShowAddContact] = reactExports.useState(false);
  const filteredFeed = feed.filter((item) => matchesFilter(item, activeFilter)).filter((item) => {
    var _a;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || (((_a = item.counterpartyName) == null ? void 0 : _a.toLowerCase().includes(q)) ?? false) || item.amountCents != null && String(item.amountCents / 100).includes(q);
  });
  const publicCount = feed.filter((i) => i.isPublic).length;
  const totalReactions = feed.reduce(
    (sum, item) => sum + item.reactions.reduce((s, r) => s + r.count, 0),
    0
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", "data-ocid": "activity.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold tracking-tight", children: "Activity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Your payment history and social feed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => refetch(),
          className: "gap-2",
          "data-ocid": "activity.refresh_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
            "Refresh"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary" }),
        label: "Transactions",
        value: feed.length
      },
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4 text-primary" }),
        label: "Public",
        value: publicCount
      },
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-accent-foreground" }),
        label: "Reactions",
        value: totalReactions
      }
    ].map(({ icon, label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold tabular-nums", children: value })
      ] })
    ] }) }, label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "feed", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full", "data-ocid": "activity.tabs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "feed",
            className: "flex-1 gap-2",
            "data-ocid": "activity.feed.tab",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
              "Feed"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "contacts",
            className: "flex-1 gap-2",
            "data-ocid": "activity.contacts.tab",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
              "Trusted Contacts",
              contacts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 h-5 text-xs", children: contacts.length })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "feed", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search by name or amount...",
              className: "pl-9",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              "data-ocid": "activity.search_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", "data-ocid": "activity.filter.tab", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setActiveFilter(f.value),
            className: cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
              activeFilter === f.value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            ),
            "data-ocid": `activity.filter.${f.value}`,
            children: f.label
          },
          f.value
        )) }),
        feedLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "activity.loading_state", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-xl" }, i)) }) : filteredFeed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            className: "text-center py-16 space-y-3",
            "data-ocid": "activity.empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-8 w-8 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: searchQuery ? "No results found" : "No activity yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xs mx-auto", children: searchQuery ? `No transactions match "${searchQuery}"` : "Send your first payment to see activity here" }),
              searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => setSearchQuery(""),
                  "data-ocid": "activity.clear_search_button",
                  children: "Clear search"
                }
              )
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filteredFeed.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityCard, { item, index: i + 1 }, item.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground py-2", children: [
            filteredFeed.length,
            " item",
            filteredFeed.length !== 1 ? "s" : "",
            activeFilter !== "all" || searchQuery ? " (filtered)" : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "contacts", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            contacts.length,
            " trusted contact",
            contacts.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "gap-2",
              onClick: () => setShowAddContact(true),
              "data-ocid": "contacts.add_contact_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                "Add Contact"
              ]
            }
          )
        ] }),
        contactsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "contacts.loading_state", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-xl" }, i)) }) : contacts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            className: "text-center py-16 space-y-4",
            "data-ocid": "contacts.empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-8 w-8 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: "No trusted contacts" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-xs mx-auto", children: "Add family, friends, and colleagues for quick payments and emergency access" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  className: "gap-2",
                  onClick: () => setShowAddContact(true),
                  "data-ocid": "contacts.empty_add_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                    "Add your first contact"
                  ]
                }
              )
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: contacts.map((contact, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ContactCard,
            {
              contact,
              index: i + 1
            },
            contact.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-muted/30 border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-2", children: "Access Levels" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: [
              {
                level: "View-only",
                desc: "Can see your transactions"
              },
              {
                level: "Emergency",
                desc: "Can send on your behalf in emergencies"
              },
              {
                level: "Full",
                desc: "Complete access to your account"
              }
            ].map(({ level, desc }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-2 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-muted-foreground/50" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: level }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                    "— ",
                    desc
                  ] })
                ]
              },
              level
            )) })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddContactModal,
      {
        open: showAddContact,
        onClose: () => setShowAddContact(false)
      }
    )
  ] });
}
export {
  ActivityPage as default
};
