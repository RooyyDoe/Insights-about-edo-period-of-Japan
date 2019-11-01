
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.12.1 */

    function create_fragment(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); component_subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); component_subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            hasActiveRoute = true;
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { basepath, url, hasActiveRoute, $base, $location, $routes };
    	};

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('$base' in $$props) base.set($base);
    		if ('$location' in $$props) location.set($location);
    		if ('$routes' in $$props) routes.set($routes);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["basepath", "url"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Router", options, id: create_fragment.name });
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.12.1 */

    const get_default_slot_changes = ({ routeParams, $location }) => ({ params: routeParams, location: $location });
    const get_default_slot_context = ({ routeParams, $location }) => ({
    	params: routeParams,
    	location: $location
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}", ctx });
    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.routeParams || changed.$location)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(43:2) {:else}", ctx });
    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		{ location: ctx.$location },
    		ctx.routeParams,
    		ctx.routeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.$location || changed.routeParams || changed.routeProps) ? get_spread_update(switch_instance_spread_levels, [
    									(changed.$location) && { location: ctx.$location },
    			(changed.routeParams) && get_spread_object(ctx.routeParams),
    			(changed.routeProps) && get_spread_object(ctx.routeProps)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(41:2) {#if component !== null}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute, $location;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); component_subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });
      const location = getContext(LOCATION); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};
      let routeProps = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$new_props) $$invalidate('path', path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate('component', component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { path, component, routeParams, routeProps, $activeRoute, $location };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate('path', path = $$new_props.path);
    		if ('component' in $$props) $$invalidate('component', component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate('routeParams', routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate('routeProps', routeProps = $$new_props.routeProps);
    		if ('$activeRoute' in $$props) activeRoute.set($activeRoute);
    		if ('$location' in $$props) location.set($location);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1, $$props: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    		{
            const { path, component, ...rest } = $$props;
            $$invalidate('routeProps', routeProps = rest);
          }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["path", "component"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Route", options, id: create_fragment$1.name });
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.12.1 */

    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    			dispose = listen_dev(a, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); component_subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); component_subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { to, replace, state, getProps, href, isPartiallyCurrent, isCurrent, props, $base, $location, ariaCurrent };
    	};

    	$$self.$inject_state = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('href' in $$props) $$invalidate('href', href = $$props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate('isPartiallyCurrent', isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate('isCurrent', isCurrent = $$props.isCurrent);
    		if ('props' in $$props) $$invalidate('props', props = $$props.props);
    		if ('$base' in $$props) base.set($base);
    		if ('$location' in $$props) location.set($location);
    		if ('ariaCurrent' in $$props) $$invalidate('ariaCurrent', ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "replace", "state", "getProps"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Link", options, id: create_fragment$2.name });
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/App.svelte";

    // (37:0) <Router url="{url}">
    function create_default_slot(ctx) {
    	var div, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, current;

    	var route0 = new Route({
    		props: { path: "/", component: Home },
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: { path: "Gokomyo", component: Gokomyo },
    		$$inline: true
    	});

    	var route2 = new Route({
    		props: {
    		path: "Gomizunoo",
    		component: Gomizunoo
    	},
    		$$inline: true
    	});

    	var route3 = new Route({
    		props: {
    		path: "Gomomozono",
    		component: Gomomozono
    	},
    		$$inline: true
    	});

    	var route4 = new Route({
    		props: { path: "Gosai", component: Gosai },
    		$$inline: true
    	});

    	var route5 = new Route({
    		props: {
    		path: "Gosakuramachi",
    		component: Gosakuramachi
    	},
    		$$inline: true
    	});

    	var route6 = new Route({
    		props: {
    		path: "Higashiyama",
    		component: Higashiyama
    	},
    		$$inline: true
    	});

    	var route7 = new Route({
    		props: {
    		path: "Nakamikado",
    		component: Nakamikado
    	},
    		$$inline: true
    	});

    	var route8 = new Route({
    		props: { path: "Kokaku", component: Kokaku },
    		$$inline: true
    	});

    	var route9 = new Route({
    		props: { path: "Komei", component: Komei },
    		$$inline: true
    	});

    	var route10 = new Route({
    		props: { path: "Meisho", component: Meisho },
    		$$inline: true
    	});

    	var route11 = new Route({
    		props: {
    		path: "Momozono",
    		component: Momozono
    	},
    		$$inline: true
    	});

    	var route12 = new Route({
    		props: { path: "Ninko", component: Ninko },
    		$$inline: true
    	});

    	var route13 = new Route({
    		props: { path: "Reigen", component: Reigen },
    		$$inline: true
    	});

    	var route14 = new Route({
    		props: {
    		path: "Sakuramachi",
    		component: Sakuramachi
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			route0.$$.fragment.c();
    			t0 = space();
    			route1.$$.fragment.c();
    			t1 = space();
    			route2.$$.fragment.c();
    			t2 = space();
    			route3.$$.fragment.c();
    			t3 = space();
    			route4.$$.fragment.c();
    			t4 = space();
    			route5.$$.fragment.c();
    			t5 = space();
    			route6.$$.fragment.c();
    			t6 = space();
    			route7.$$.fragment.c();
    			t7 = space();
    			route8.$$.fragment.c();
    			t8 = space();
    			route9.$$.fragment.c();
    			t9 = space();
    			route10.$$.fragment.c();
    			t10 = space();
    			route11.$$.fragment.c();
    			t11 = space();
    			route12.$$.fragment.c();
    			t12 = space();
    			route13.$$.fragment.c();
    			t13 = space();
    			route14.$$.fragment.c();
    			add_location(div, file$1, 37, 2, 619);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t0);
    			mount_component(route1, div, null);
    			append_dev(div, t1);
    			mount_component(route2, div, null);
    			append_dev(div, t2);
    			mount_component(route3, div, null);
    			append_dev(div, t3);
    			mount_component(route4, div, null);
    			append_dev(div, t4);
    			mount_component(route5, div, null);
    			append_dev(div, t5);
    			mount_component(route6, div, null);
    			append_dev(div, t6);
    			mount_component(route7, div, null);
    			append_dev(div, t7);
    			mount_component(route8, div, null);
    			append_dev(div, t8);
    			mount_component(route9, div, null);
    			append_dev(div, t9);
    			mount_component(route10, div, null);
    			append_dev(div, t10);
    			mount_component(route11, div, null);
    			append_dev(div, t11);
    			mount_component(route12, div, null);
    			append_dev(div, t12);
    			mount_component(route13, div, null);
    			append_dev(div, t13);
    			mount_component(route14, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);

    			transition_in(route1.$$.fragment, local);

    			transition_in(route2.$$.fragment, local);

    			transition_in(route3.$$.fragment, local);

    			transition_in(route4.$$.fragment, local);

    			transition_in(route5.$$.fragment, local);

    			transition_in(route6.$$.fragment, local);

    			transition_in(route7.$$.fragment, local);

    			transition_in(route8.$$.fragment, local);

    			transition_in(route9.$$.fragment, local);

    			transition_in(route10.$$.fragment, local);

    			transition_in(route11.$$.fragment, local);

    			transition_in(route12.$$.fragment, local);

    			transition_in(route13.$$.fragment, local);

    			transition_in(route14.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			transition_out(route9.$$.fragment, local);
    			transition_out(route10.$$.fragment, local);
    			transition_out(route11.$$.fragment, local);
    			transition_out(route12.$$.fragment, local);
    			transition_out(route13.$$.fragment, local);
    			transition_out(route14.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(route0);

    			destroy_component(route1);

    			destroy_component(route2);

    			destroy_component(route3);

    			destroy_component(route4);

    			destroy_component(route5);

    			destroy_component(route6);

    			destroy_component(route7);

    			destroy_component(route8);

    			destroy_component(route9);

    			destroy_component(route10);

    			destroy_component(route11);

    			destroy_component(route12);

    			destroy_component(route13);

    			destroy_component(route14);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(37:0) <Router url=\"{url}\">", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var current;

    	var router = new Router({
    		props: {
    		url: ctx.url,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.url) router_changes.url = ctx.url;
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
    	let { url = "" } = $$props;

    	const writable_props = ['url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	$$self.$capture_state = () => {
    		return { url };
    	};

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	return { url };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["url"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$3.name });
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/nav.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/components/nav.svelte";

    // (215:8) <Link to="Gomizunoo">
    function create_default_slot_14(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1611–1629 Go-Mizunoo";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 215, 12, 3444);
    			attr_dev(img, "class", "bottom svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Go-Mizunoo.jpg");
    			attr_dev(img, "alt", "Go-Mizunoo");
    			add_location(img, file$2, 216, 12, 3498);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_14.name, type: "slot", source: "(215:8) <Link to=\"Gomizunoo\">", ctx });
    	return block;
    }

    // (221:8) <Link to="Meisho">
    function create_default_slot_13(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1629–1643 Meishō";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 221, 12, 3673);
    			attr_dev(img, "class", " svelte-anzma0");
    			attr_dev(img, "src", "images/Meisho_of_Japan.jpg");
    			attr_dev(img, "alt", "Meishō");
    			add_location(img, file$2, 222, 12, 3723);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_13.name, type: "slot", source: "(221:8) <Link to=\"Meisho\">", ctx });
    	return block;
    }

    // (227:8) <Link to="Gokomyo">
    function create_default_slot_12(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1643–1654 Go-Kōmyō";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 227, 12, 3887);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Go-Kōmyō.jpg");
    			attr_dev(img, "alt", "Go-Kōmyō");
    			add_location(img, file$2, 228, 12, 3939);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_12.name, type: "slot", source: "(227:8) <Link to=\"Gokomyo\">", ctx });
    	return block;
    }

    // (233:8) <Link to="Gosai">
    function create_default_slot_11(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1655–1663 Go-Sai";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 233, 12, 4105);
    			attr_dev(img, "class", " svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Go-Sai.jpg");
    			attr_dev(img, "alt", "Go-Sai");
    			add_location(img, file$2, 234, 12, 4155);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_11.name, type: "slot", source: "(233:8) <Link to=\"Gosai\">", ctx });
    	return block;
    }

    // (239:8) <Link to="Reigen">
    function create_default_slot_10(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1663–1687 Reigen";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 239, 12, 4316);
    			attr_dev(img, "class", " svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Reigen.jpg");
    			attr_dev(img, "alt", "Reigen");
    			add_location(img, file$2, 240, 12, 4366);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_10.name, type: "slot", source: "(239:8) <Link to=\"Reigen\">", ctx });
    	return block;
    }

    // (245:8) <Link to="Higashiyama">
    function create_default_slot_9(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1687–1709 Higashiyama";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 245, 12, 4537);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/800px-Emperor_Higashiyama.jpg");
    			attr_dev(img, "alt", "Higashiyama");
    			add_location(img, file$2, 246, 12, 4592);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_9.name, type: "slot", source: "(245:8) <Link to=\"Higashiyama\">", ctx });
    	return block;
    }

    // (251:8) <Link to="Nakamikado">
    function create_default_slot_8(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1709–1735 Nakamikado";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 251, 12, 4780);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Nakamikado.jpg");
    			attr_dev(img, "alt", "Nakamikado");
    			add_location(img, file$2, 252, 12, 4834);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_8.name, type: "slot", source: "(251:8) <Link to=\"Nakamikado\">", ctx });
    	return block;
    }

    // (257:8) <Link to="Sakuramachi">
    function create_default_slot_7(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1735–1747 Sakuramachi";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 257, 12, 5016);
    			attr_dev(img, "class", " svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Sakuramachi.jpg");
    			attr_dev(img, "alt", "Sakuramachi");
    			add_location(img, file$2, 258, 12, 5071);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_7.name, type: "slot", source: "(257:8) <Link to=\"Sakuramachi\">", ctx });
    	return block;
    }

    // (263:8) <Link to="Momozono">
    function create_default_slot_6(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1747–1762 Momozono";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 263, 12, 5246);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/1280px-Emperor_Momozono.jpg");
    			attr_dev(img, "alt", "Momozono");
    			add_location(img, file$2, 264, 12, 5298);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_6.name, type: "slot", source: "(263:8) <Link to=\"Momozono\">", ctx });
    	return block;
    }

    // (269:8) <Link to="Gosakuramachi">
    function create_default_slot_5(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1762–1771 Go-Sakuramachi";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 269, 12, 5487);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/Empress_Go-Sakuramachi.jpg");
    			attr_dev(img, "alt", "Go-Sakuramachi");
    			add_location(img, file$2, 270, 12, 5545);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5.name, type: "slot", source: "(269:8) <Link to=\"Gosakuramachi\">", ctx });
    	return block;
    }

    // (275:8) <Link to="Gomomozono">
    function create_default_slot_4(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1771–1779 Go-Momozono";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 275, 12, 5733);
    			attr_dev(img, "class", " svelte-anzma0");
    			attr_dev(img, "src", "images/1024px-Emperor_Go-Momozono.jpg");
    			attr_dev(img, "alt", "Go-Momozono");
    			add_location(img, file$2, 276, 12, 5788);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(275:8) <Link to=\"Gomomozono\">", ctx });
    	return block;
    }

    // (281:8) <Link to="Kokaku">
    function create_default_slot_3(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1780–1817 Kōkaku";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 281, 12, 5966);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Kōkaku.jpg");
    			attr_dev(img, "alt", "Kōkaku");
    			add_location(img, file$2, 282, 12, 6016);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(281:8) <Link to=\"Kokaku\">", ctx });
    	return block;
    }

    // (287:8) <Link to="Ninko">
    function create_default_slot_2(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1817–1846 Ninkō";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			add_location(p, file$2, 287, 12, 6178);
    			attr_dev(img, "class", "top svelte-anzma0");
    			attr_dev(img, "src", "images/Emperor_Ninkō.jpg");
    			attr_dev(img, "alt", "Ninkō");
    			add_location(img, file$2, 288, 12, 6227);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(287:8) <Link to=\"Ninko\">", ctx });
    	return block;
    }

    // (293:8) <Link to="Komei">
    function create_default_slot_1(ctx) {
    	var p, t_1, img;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "1846–1867 Kōmei";
    			t_1 = space();
    			img = element("img");
    			attr_dev(p, "class", "title svelte-anzma0");
    			set_style(p, "color", "white");
    			add_location(p, file$2, 293, 12, 6387);
    			attr_dev(img, "class", " svelte-anzma0");
    			attr_dev(img, "src", "images/800px-The_Emperor_Komei.jpg");
    			attr_dev(img, "alt", "Kōmei");
    			add_location(img, file$2, 294, 12, 6458);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(293:8) <Link to=\"Komei\">", ctx });
    	return block;
    }

    // (212:0) <Router url="{url}">
    function create_default_slot$1(ctx) {
    	var nav, div0, t0, div1, t1, div2, t2, div3, t3, div4, t4, div5, t5, div6, t6, div7, t7, div8, t8, div9, t9, div10, t10, div11, t11, div12, t12, div13, current;

    	var link0 = new Link({
    		props: {
    		to: "Gomizunoo",
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: "Meisho",
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link2 = new Link({
    		props: {
    		to: "Gokomyo",
    		$$slots: { default: [create_default_slot_12] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link3 = new Link({
    		props: {
    		to: "Gosai",
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link4 = new Link({
    		props: {
    		to: "Reigen",
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link5 = new Link({
    		props: {
    		to: "Higashiyama",
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link6 = new Link({
    		props: {
    		to: "Nakamikado",
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link7 = new Link({
    		props: {
    		to: "Sakuramachi",
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link8 = new Link({
    		props: {
    		to: "Momozono",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link9 = new Link({
    		props: {
    		to: "Gosakuramachi",
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link10 = new Link({
    		props: {
    		to: "Gomomozono",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link11 = new Link({
    		props: {
    		to: "Kokaku",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link12 = new Link({
    		props: {
    		to: "Ninko",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link13 = new Link({
    		props: {
    		to: "Komei",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			link0.$$.fragment.c();
    			t0 = space();
    			div1 = element("div");
    			link1.$$.fragment.c();
    			t1 = space();
    			div2 = element("div");
    			link2.$$.fragment.c();
    			t2 = space();
    			div3 = element("div");
    			link3.$$.fragment.c();
    			t3 = space();
    			div4 = element("div");
    			link4.$$.fragment.c();
    			t4 = space();
    			div5 = element("div");
    			link5.$$.fragment.c();
    			t5 = space();
    			div6 = element("div");
    			link6.$$.fragment.c();
    			t6 = space();
    			div7 = element("div");
    			link7.$$.fragment.c();
    			t7 = space();
    			div8 = element("div");
    			link8.$$.fragment.c();
    			t8 = space();
    			div9 = element("div");
    			link9.$$.fragment.c();
    			t9 = space();
    			div10 = element("div");
    			link10.$$.fragment.c();
    			t10 = space();
    			div11 = element("div");
    			link11.$$.fragment.c();
    			t11 = space();
    			div12 = element("div");
    			link12.$$.fragment.c();
    			t12 = space();
    			div13 = element("div");
    			link13.$$.fragment.c();
    			attr_dev(div0, "class", "animate gomizunoo svelte-anzma0");
    			add_location(div0, file$2, 213, 4, 3370);
    			attr_dev(div1, "class", "animate meisho svelte-anzma0");
    			add_location(div1, file$2, 219, 4, 3605);
    			attr_dev(div2, "class", "animate gokomyo svelte-anzma0");
    			add_location(div2, file$2, 225, 4, 3817);
    			attr_dev(div3, "class", "animate gosai svelte-anzma0");
    			add_location(div3, file$2, 231, 4, 4039);
    			attr_dev(div4, "class", "animate reigen svelte-anzma0");
    			add_location(div4, file$2, 237, 4, 4248);
    			attr_dev(div5, "class", "animate higashiyama svelte-anzma0");
    			add_location(div5, file$2, 243, 4, 4459);
    			attr_dev(div6, "class", "animate nakamikado svelte-anzma0");
    			add_location(div6, file$2, 249, 4, 4704);
    			attr_dev(div7, "class", "animate sakuramachi svelte-anzma0");
    			add_location(div7, file$2, 255, 4, 4938);
    			attr_dev(div8, "class", "animate momozono svelte-anzma0");
    			add_location(div8, file$2, 261, 4, 5174);
    			attr_dev(div9, "class", "animate gosakuramachi svelte-anzma0");
    			add_location(div9, file$2, 267, 4, 5405);
    			attr_dev(div10, "class", "animate gomomozono svelte-anzma0");
    			add_location(div10, file$2, 273, 4, 5657);
    			attr_dev(div11, "class", "animate kokaku svelte-anzma0");
    			add_location(div11, file$2, 279, 4, 5898);
    			attr_dev(div12, "class", "animate ninko svelte-anzma0");
    			add_location(div12, file$2, 285, 4, 6112);
    			attr_dev(div13, "class", "animate komei svelte-anzma0");
    			add_location(div13, file$2, 291, 4, 6321);
    			add_location(nav, file$2, 212, 2, 3359);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			mount_component(link0, div0, null);
    			append_dev(nav, t0);
    			append_dev(nav, div1);
    			mount_component(link1, div1, null);
    			append_dev(nav, t1);
    			append_dev(nav, div2);
    			mount_component(link2, div2, null);
    			append_dev(nav, t2);
    			append_dev(nav, div3);
    			mount_component(link3, div3, null);
    			append_dev(nav, t3);
    			append_dev(nav, div4);
    			mount_component(link4, div4, null);
    			append_dev(nav, t4);
    			append_dev(nav, div5);
    			mount_component(link5, div5, null);
    			append_dev(nav, t5);
    			append_dev(nav, div6);
    			mount_component(link6, div6, null);
    			append_dev(nav, t6);
    			append_dev(nav, div7);
    			mount_component(link7, div7, null);
    			append_dev(nav, t7);
    			append_dev(nav, div8);
    			mount_component(link8, div8, null);
    			append_dev(nav, t8);
    			append_dev(nav, div9);
    			mount_component(link9, div9, null);
    			append_dev(nav, t9);
    			append_dev(nav, div10);
    			mount_component(link10, div10, null);
    			append_dev(nav, t10);
    			append_dev(nav, div11);
    			mount_component(link11, div11, null);
    			append_dev(nav, t11);
    			append_dev(nav, div12);
    			mount_component(link12, div12, null);
    			append_dev(nav, t12);
    			append_dev(nav, div13);
    			mount_component(link13, div13, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link0_changes = {};
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			var link2_changes = {};
    			if (changed.$$scope) link2_changes.$$scope = { changed, ctx };
    			link2.$set(link2_changes);

    			var link3_changes = {};
    			if (changed.$$scope) link3_changes.$$scope = { changed, ctx };
    			link3.$set(link3_changes);

    			var link4_changes = {};
    			if (changed.$$scope) link4_changes.$$scope = { changed, ctx };
    			link4.$set(link4_changes);

    			var link5_changes = {};
    			if (changed.$$scope) link5_changes.$$scope = { changed, ctx };
    			link5.$set(link5_changes);

    			var link6_changes = {};
    			if (changed.$$scope) link6_changes.$$scope = { changed, ctx };
    			link6.$set(link6_changes);

    			var link7_changes = {};
    			if (changed.$$scope) link7_changes.$$scope = { changed, ctx };
    			link7.$set(link7_changes);

    			var link8_changes = {};
    			if (changed.$$scope) link8_changes.$$scope = { changed, ctx };
    			link8.$set(link8_changes);

    			var link9_changes = {};
    			if (changed.$$scope) link9_changes.$$scope = { changed, ctx };
    			link9.$set(link9_changes);

    			var link10_changes = {};
    			if (changed.$$scope) link10_changes.$$scope = { changed, ctx };
    			link10.$set(link10_changes);

    			var link11_changes = {};
    			if (changed.$$scope) link11_changes.$$scope = { changed, ctx };
    			link11.$set(link11_changes);

    			var link12_changes = {};
    			if (changed.$$scope) link12_changes.$$scope = { changed, ctx };
    			link12.$set(link12_changes);

    			var link13_changes = {};
    			if (changed.$$scope) link13_changes.$$scope = { changed, ctx };
    			link13.$set(link13_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);

    			transition_in(link1.$$.fragment, local);

    			transition_in(link2.$$.fragment, local);

    			transition_in(link3.$$.fragment, local);

    			transition_in(link4.$$.fragment, local);

    			transition_in(link5.$$.fragment, local);

    			transition_in(link6.$$.fragment, local);

    			transition_in(link7.$$.fragment, local);

    			transition_in(link8.$$.fragment, local);

    			transition_in(link9.$$.fragment, local);

    			transition_in(link10.$$.fragment, local);

    			transition_in(link11.$$.fragment, local);

    			transition_in(link12.$$.fragment, local);

    			transition_in(link13.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			transition_out(link6.$$.fragment, local);
    			transition_out(link7.$$.fragment, local);
    			transition_out(link8.$$.fragment, local);
    			transition_out(link9.$$.fragment, local);
    			transition_out(link10.$$.fragment, local);
    			transition_out(link11.$$.fragment, local);
    			transition_out(link12.$$.fragment, local);
    			transition_out(link13.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(nav);
    			}

    			destroy_component(link0);

    			destroy_component(link1);

    			destroy_component(link2);

    			destroy_component(link3);

    			destroy_component(link4);

    			destroy_component(link5);

    			destroy_component(link6);

    			destroy_component(link7);

    			destroy_component(link8);

    			destroy_component(link9);

    			destroy_component(link10);

    			destroy_component(link11);

    			destroy_component(link12);

    			destroy_component(link13);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(212:0) <Router url=\"{url}\">", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div, t, current;

    	var router = new Router({
    		props: {
    		url: ctx.url,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			router.$$.fragment.c();
    			attr_dev(div, "class", "wrapper");
    			add_location(div, file$2, 210, 0, 3308);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.url) router_changes.url = ctx.url;
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    				detach_dev(t);
    			}

    			destroy_component(router, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;

    	const writable_props = ['url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	$$self.$capture_state = () => {
    		return { url };
    	};

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	return { url };
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["url"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Nav", options, id: create_fragment$4.name });
    	}

    	get url() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/pages/Home.svelte";

    function create_fragment$5(ctx) {
    	var h1, t_1, current;

    	var nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Cultural insights in the Edo period of Japan!";
    			t_1 = space();
    			nav.$$.fragment.c();
    			add_location(h1, file$3, 4, 1, 65);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t_1, anchor);
    			mount_component(nav, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    				detach_dev(t_1);
    			}

    			destroy_component(nav, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Home", options, id: create_fragment$5.name });
    	}
    }

    function results() {
    		
    	const url ='https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';
    	
    	const query = `
	PREFIX dc: <http://purl.org/dc/elements/1.1/>
	PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
	PREFIX edm: <http://www.europeana.eu/schemas/edm/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	
	SELECT ?cho (SAMPLE(?title) AS ?uniqueTitle) (SAMPLE(?img) AS ?uniqueImage) (SAMPLE(?periode) AS ?uniquePeriod) (SAMPLE(?herkomstLabel) AS ?uniqueHerkomstLabel) (SAMPLE(?jaartal) AS ?uniqueJaartal) WHERE {
	   <https://hdl.handle.net/20.500.11840/termmaster4400> skos:narrower* ?concept .
	   ?concept skos:prefLabel ?periode .
	   VALUES ?periode { "Edo (Japanse periode)" }
	  
	   ?cho dc:title ?title .
	   ?cho edm:isShownBy ?img .
	  
	   ?cho dct:created ?jaartal .
	   filter(xsd:integer(?jaartal) >= 1611 && xsd:integer(?jaartal) <= 1868)
	  
	   ?cho dct:spatial ?herkomst .
	   ?herkomst skos:prefLabel ?herkomstLabel .
	   VALUES ?herkomstLabel { "Japan" } .
	  
	   FILTER langMatches(lang(?title), "ned")
	} GROUP BY ?cho
	`;

    	function runQuery(url, query){
    		return fetch(url+'?query='+ encodeURIComponent(query) +'&format=json')
    			.then(res => res.json()) //array van objecten, hier moet overheen gelooped worden voor html, in een loop img create element die je append met een src van een van de objecten met de link 
    			.then(json => {
    				// console.log(json);
    				// console.table(json.results);
    				return json.results.bindings;
    			});
    	} //de JSON sla je op een een var bijvoorbeeld, dan loop je hierovereen (for each budda in buddas)

    	return runQuery(url, query);
    }

    /* src/components/showdata.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/components/showdata.svelte";

    function create_fragment$6(ctx) {
    	var a, span1, span0, h3, t0_value = ctx.Showdata.uniqueTitle.value + "", t0, t1, span2, t3, span3, t4, t5_value = ctx.Showdata.uniqueJaartal.value + "", t5;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span1 = element("span");
    			span0 = element("span");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			span2 = element("span");
    			span2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.";
    			t3 = space();
    			span3 = element("span");
    			t4 = text("Founded at: ");
    			t5 = text(t5_value);
    			attr_dev(h3, "class", "svelte-1obbbx5");
    			add_location(h3, file$4, 140, 4, 2720);
    			attr_dev(span0, "class", "card-title svelte-1obbbx5");
    			add_location(span0, file$4, 139, 2, 2690);
    			attr_dev(span1, "class", "card-header svelte-1obbbx5");
    			set_style(span1, "background-image", "url(" + ctx.Showdata.uniqueImage.value + ")");
    			add_location(span1, file$4, 138, 2, 2600);
    			attr_dev(span2, "class", "card-summary svelte-1obbbx5");
    			add_location(span2, file$4, 143, 2, 2780);
    			attr_dev(span3, "class", "card-meta svelte-1obbbx5");
    			add_location(span3, file$4, 146, 2, 2941);
    			attr_dev(a, "class", "card svelte-1obbbx5");
    			attr_dev(a, "href", "/");
    			add_location(a, file$4, 137, 0, 2572);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span1);
    			append_dev(span1, span0);
    			append_dev(span0, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, span2);
    			append_dev(a, t3);
    			append_dev(a, span3);
    			append_dev(span3, t4);
    			append_dev(span3, t5);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.Showdata) && t0_value !== (t0_value = ctx.Showdata.uniqueTitle.value + "")) {
    				set_data_dev(t0, t0_value);
    			}

    			if (changed.Showdata) {
    				set_style(span1, "background-image", "url(" + ctx.Showdata.uniqueImage.value + ")");
    			}

    			if ((changed.Showdata) && t5_value !== (t5_value = ctx.Showdata.uniqueJaartal.value + "")) {
    				set_data_dev(t5, t5_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { Showdata } = $$props;

    	const writable_props = ['Showdata'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Showdata> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('Showdata' in $$props) $$invalidate('Showdata', Showdata = $$props.Showdata);
    	};

    	$$self.$capture_state = () => {
    		return { Showdata };
    	};

    	$$self.$inject_state = $$props => {
    		if ('Showdata' in $$props) $$invalidate('Showdata', Showdata = $$props.Showdata);
    	};

    	return { Showdata };
    }

    class Showdata_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, ["Showdata"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Showdata_1", options, id: create_fragment$6.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.Showdata === undefined && !('Showdata' in props)) {
    			console.warn("<Showdata> was created without expected prop 'Showdata'");
    		}
    	}

    	get Showdata() {
    		throw new Error("<Showdata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Showdata(value) {
    		throw new Error("<Showdata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/extradata.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/components/extradata.svelte";

    function create_fragment$7(ctx) {
    	var div1, div0, h10, t0, t1, h11, t2, t3, p0, t4, t5, img, t6, p1, t7;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text(ctx.title);
    			t1 = space();
    			h11 = element("h1");
    			t2 = text(ctx.years);
    			t3 = space();
    			p0 = element("p");
    			t4 = text(ctx.name);
    			t5 = space();
    			img = element("img");
    			t6 = space();
    			p1 = element("p");
    			t7 = text(ctx.description);
    			attr_dev(h10, "class", "svelte-1ab9jtj");
    			add_location(h10, file$5, 46, 8, 542);
    			attr_dev(h11, "class", "svelte-1ab9jtj");
    			add_location(h11, file$5, 47, 8, 567);
    			attr_dev(div0, "class", "innerwrapper svelte-1ab9jtj");
    			add_location(div0, file$5, 45, 4, 506);
    			attr_dev(p0, "class", "svelte-1ab9jtj");
    			add_location(p0, file$5, 49, 4, 599);
    			attr_dev(img, "src", ctx.image);
    			attr_dev(img, "alt", ctx.title);
    			attr_dev(img, "class", "svelte-1ab9jtj");
    			add_location(img, file$5, 50, 4, 617);
    			attr_dev(p1, "class", "svelte-1ab9jtj");
    			add_location(p1, file$5, 51, 4, 657);
    			attr_dev(div1, "class", "wrapper svelte-1ab9jtj");
    			add_location(div1, file$5, 44, 0, 480);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h10);
    			append_dev(h10, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h11);
    			append_dev(h11, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, img);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(p1, t7);
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data_dev(t0, ctx.title);
    			}

    			if (changed.years) {
    				set_data_dev(t2, ctx.years);
    			}

    			if (changed.name) {
    				set_data_dev(t4, ctx.name);
    			}

    			if (changed.image) {
    				attr_dev(img, "src", ctx.image);
    			}

    			if (changed.title) {
    				attr_dev(img, "alt", ctx.title);
    			}

    			if (changed.description) {
    				set_data_dev(t7, ctx.description);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { title, name, years, description, image } = $$props;

    	const writable_props = ['title', 'name', 'years', 'description', 'image'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Extradata> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('years' in $$props) $$invalidate('years', years = $$props.years);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('image' in $$props) $$invalidate('image', image = $$props.image);
    	};

    	$$self.$capture_state = () => {
    		return { title, name, years, description, image };
    	};

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('years' in $$props) $$invalidate('years', years = $$props.years);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('image' in $$props) $$invalidate('image', image = $$props.image);
    	};

    	return { title, name, years, description, image };
    }

    class Extradata extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, ["title", "name", "years", "description", "image"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Extradata", options, id: create_fragment$7.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.title === undefined && !('title' in props)) {
    			console.warn("<Extradata> was created without expected prop 'title'");
    		}
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<Extradata> was created without expected prop 'name'");
    		}
    		if (ctx.years === undefined && !('years' in props)) {
    			console.warn("<Extradata> was created without expected prop 'years'");
    		}
    		if (ctx.description === undefined && !('description' in props)) {
    			console.warn("<Extradata> was created without expected prop 'description'");
    		}
    		if (ctx.image === undefined && !('image' in props)) {
    			console.warn("<Extradata> was created without expected prop 'image'");
    		}
    	}

    	get title() {
    		throw new Error("<Extradata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Extradata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Extradata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Extradata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get years() {
    		throw new Error("<Extradata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set years(value) {
    		throw new Error("<Extradata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Extradata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Extradata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Extradata>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Extradata>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Gokomyo.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/pages/Gokomyo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (128:12) {:else}
    function create_else_block$1(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$1.name, type: "else", source: "(128:12) {:else}", ctx });
    	return block;
    }

    // (126:8) {#each filteredData as Showdata}
    function create_each_block(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(126:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Go-Kōmyō",
    		years: "1643–1654",
    		name: "Tsuguhito",
    		image: "images/Emperor_Go-Kōmyō.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$6, 124, 4, 5560);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$6, 123, 0, 5532);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$1(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	
        
        let data = [];
        let filteredData = [];

        onMount( async () => {
            // wacht totdat de data is ingeladen en zet het dan in de lege array gemaand data
            data = await results();

            // console.log(data.map(el => el.uniqueJaartal.value === "1619").filter(e => e)) 

            /**
             * Geeft een array terug met de te matchen jaren
             * 
             * @return {Array}
             */
            const getDates = (dates) => {
                // Check of de/het jaartal(len) die je wilt checken een streepje heeft.
                // Wanneer het een streepje heeft, is het een periode in plaats van een
                // specifiek jaartal
                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    // split de twee jaartallen op het streepje, en cast beide jaartallen
                    // naar een integer, zodat deze later vergeleken kunnen worden met de jaar- 
                    // tallen van de resultaten
                    // Array.map() loopt over alle waarden in de array heen en muteert de waarde (e)
                    // op die plek in de array. Bij deze loop worden whitespaces weggehaald en
                    // van strings dus integers gemaakt
                    // ["100 ", "200"] wordt dan [100, 200]
                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {
                    // Wanneer er geen streepje in het jaartal, moet deze in ieder geval een 
                    // valide getal zijn. isNan() checkt daar op (is Not A Number)
                    // en als het een getal is, cast hij hem naar een getal
                    return [parseInt(dates.trim())];
                }

                // geen jaartal, met of zonder streepje. Someone fucked it up
                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1646");

            $$invalidate('filteredData', filteredData = data.filter(el => {
                // zet jaartallen van het artikel in een array, zoals boven beschreven
                const dates = getDates(el.uniqueJaartal.value);
                // Wanneer er geen streepje is
                if (dates.length === 1) {
                    // kijk of de te checken jaartal een streepje heeft
                    return yearToCheck.length === 1 ? 
                        // geen streepje, dan gewoon 1-op-1 checken
                        yearToCheck[0] === dates[0] :
                        // wel een streepje? Dan moet het begin van de te checken periode minder zijn dan 
                        // het jaartal van het artikel, en het einde van de te checken periode meer.
                        // Dus -> "1828 - 1856" filteren -> 1828 is minder dan bijv. 1855 en 1856 is meer, dus 1855 
                        // wordt meegenomen in de filtering
                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {
                    // Check van een periode, aangezien er een streepje zit in het jaartal van het artikel
                    return yearToCheck.length === 1 ? 
                        // er wordt gecheckt op 1 jaartal, dan moet deze binnen de periode liggen van het artikel
                        // dus meer dan de begin van die periode, en minder dan het einde van die periode 
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :
                        // Er zit ee nstreepje in beide jaartallen, dan moeten de jaartallen van de te checken periode
                        // binnen de jaartallen van de periode van het artikelliggen.
                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }
                // wanneer dates.length >= 3 of 0 is, is dit geen valide datum of periode, waardoor 
                // dit artikel sowieso niet meegenomen wordt in de filtering. 
                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Gokomyo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Gokomyo", options, id: create_fragment$8.name });
    	}
    }

    /* src/pages/Gomizunoo.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/pages/Gomizunoo.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (128:12) {:else}
    function create_else_block$2(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$2.name, type: "else", source: "(128:12) {:else}", ctx });
    	return block;
    }

    // (126:8) {#each filteredData as Showdata}
    function create_each_block$1(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(126:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Go-Mizunoo",
    		years: "1611–1629",
    		name: "Kotohito",
    		image: "images/Emperor_Go-Mizunoo.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$2(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$7, 124, 4, 5477);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$7, 123, 0, 5449);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$2(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            // console.log(data.map(el => el.uniqueJaartal.value === "1619").filter(e => e)) 

            /**
             * Geeft een array terug met de te matchen jaren
             * 
             * @return {Array}
             */
            const getDates = (dates) => {
                // Check of de/het jaartal(len) die je wilt checken een streepje heeft.
                // Wanneer het een streepje heeft, is het een periode in plaats van een
                // specifiek jaartal
                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    // split de twee jaartallen op het streepje, en cast beide jaartallen
                    // naar een integer, zodat deze later vergeleken kunnen worden met de jaar- 
                    // tallen van de resultaten
                    // Array.map() loopt over alle waarden in de array heen en muteert de waarde (e)
                    // op die plek in de array. Bij deze loop worden whitespaces weggehaald en
                    // van strings dus integers gemaakt
                    // ["100 ", "200"] wordt dan [100, 200]
                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {
                    // Wanneer er geen streepje in het jaartal, moet deze in ieder geval een 
                    // valide getal zijn. isNan() checkt daar op (is Not A Number)
                    // en als het een getal is, cast hij hem naar een getal
                    return [parseInt(dates.trim())];
                }

                // geen jaartal, met of zonder streepje. Someone fucked it up
                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1600 - 1624");

            $$invalidate('filteredData', filteredData = data.filter(el => {
                // zet jaartallen van het artikel in een array, zoals boven beschreven
                const dates = getDates(el.uniqueJaartal.value);
                // Wanneer er geen streepje is
                if (dates.length === 1) {
                    // kijk of de te checken jaartal een streepje heeft
                    return yearToCheck.length === 1 ? 
                        // geen streepje, dan gewoon 1-op-1 checken
                        yearToCheck[0] === dates[0] :
                        // wel een streepje? Dan moet het begin van de te checken periode minder zijn dan 
                        // het jaartal van het artikel, en het einde van de te checken periode meer.
                        // Dus -> "1828 - 1856" filteren -> 1828 is minder dan bijv. 1855 en 1856 is meer, dus 1855 
                        // wordt meegenomen in de filtering
                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {
                    // Check van een periode, aangezien er een streepje zit in het jaartal van het artikel
                    return yearToCheck.length === 1 ? 
                        // er wordt gecheckt op 1 jaartal, dan moet deze binnen de periode liggen van het artikel
                        // dus meer dan de begin van die periode, en minder dan het einde van die periode 
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :
                        // Er zit ee nstreepje in beide jaartallen, dan moeten de jaartallen van de te checken periode
                        // binnen de jaartallen van de periode van het artikelliggen.
                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }
                // wanneer dates.length >= 3 of 0 is, is dit geen valide datum of periode, waardoor 
                // dit artikel sowieso niet meegenomen wordt in de filtering. 
                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Gomizunoo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Gomizunoo", options, id: create_fragment$9.name });
    	}
    }

    /* src/pages/Gomomozono.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/pages/Gomomozono.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (128:12) {:else}
    function create_else_block$3(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$3.name, type: "else", source: "(128:12) {:else}", ctx });
    	return block;
    }

    // (126:8) {#each filteredData as Showdata}
    function create_each_block$2(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(126:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Go-Momozono",
    		years: "1771–1779",
    		name: "Hidehito",
    		image: "images/1024px-Emperor_Go-Momozono.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$3(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$8, 124, 4, 5578);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$8, 123, 0, 5550);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$3(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {
            // Wacht totdat hij de data binnen heeft gekregen en stopt dit in de lege data array
            data = await results();

            // console.log(data.map(el => el.uniqueJaartal.value === "1619").filter(e => e)) 

            /**
             * Geeft een array terug met de te matchen jaren
             * 
             * @return {Array}
             */
            const getDates = (dates) => {
                // Check of de/het jaartal(len) die je wilt checken een streepje heeft.
                // Wanneer het een streepje heeft, is het een periode in plaats van een
                // specifiek jaartal
                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    // split de twee jaartallen op het streepje, en cast beide jaartallen
                    // naar een integer, zodat deze later vergeleken kunnen worden met de jaar- 
                    // tallen van de resultaten
                    // Array.map() loopt over alle waarden in de array heen en muteert de waarde (e)
                    // op die plek in de array. Bij deze loop worden whitespaces weggehaald en
                    // van strings dus integers gemaakt
                    // ["100 ", "200"] wordt dan [100, 200]
                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {
                    // Wanneer er geen streepje in het jaartal, moet deze in ieder geval een 
                    // valide getal zijn. isNan() checkt daar op (is Not A Number)
                    // en als het een getal is, cast hij hem naar een getal
                    return [parseInt(dates.trim())];
                }

                // geen jaartal, met of zonder streepje. Someone fucked it up
                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1771 - 1779");

            $$invalidate('filteredData', filteredData = data.filter(el => {
                // zet jaartallen van het artikel in een array, zoals boven beschreven
                const dates = getDates(el.uniqueJaartal.value);
                // Wanneer er geen streepje is
                if (dates.length === 1) {
                    // kijk of de te checken jaartal een streepje heeft
                    return yearToCheck.length === 1 ? 
                        // geen streepje, dan gewoon 1-op-1 checken
                        yearToCheck[0] === dates[0] :
                        // wel een streepje? Dan moet het begin van de te checken periode minder zijn dan 
                        // het jaartal van het artikel, en het einde van de te checken periode meer.
                        // Dus -> "1828 - 1856" filteren -> 1828 is minder dan bijv. 1855 en 1856 is meer, dus 1855 
                        // wordt meegenomen in de filtering
                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {
                    // Check van een periode, aangezien er een streepje zit in het jaartal van het artikel
                    return yearToCheck.length === 1 ? 
                        // er wordt gecheckt op 1 jaartal, dan moet deze binnen de periode liggen van het artikel
                        // dus meer dan de begin van die periode, en minder dan het einde van die periode 
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :
                        // Er zit ee nstreepje in beide jaartallen, dan moeten de jaartallen van de te checken periode
                        // binnen de jaartallen van de periode van het artikelliggen.
                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }
                // wanneer dates.length >= 3 of 0 is, is dit geen valide datum of periode, waardoor 
                // dit artikel sowieso niet meegenomen wordt in de filtering. 
                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Gomomozono extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Gomomozono", options, id: create_fragment$a.name });
    	}
    }

    /* src/pages/Gosai.svelte generated by Svelte v3.12.1 */

    const file$9 = "src/pages/Gosai.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$4(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$4.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$3(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$b(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Go-Sai",
    		years: "1655–1663",
    		name: "Nagahito",
    		image: "images/Emperor_Go-Sai.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$4(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$9, 99, 4, 2922);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$9, 98, 0, 2894);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$4(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$b.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1630 – 1670");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Gosai extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Gosai", options, id: create_fragment$b.name });
    	}
    }

    /* src/pages/Gosakuramachi.svelte generated by Svelte v3.12.1 */

    const file$a = "src/pages/Gosakuramachi.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (128:12) {:else}
    function create_else_block$5(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$5.name, type: "else", source: "(128:12) {:else}", ctx });
    	return block;
    }

    // (126:8) {#each filteredData as Showdata}
    function create_each_block$4(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(126:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$c(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Empress Go-Sakuramachi",
    		years: "1762–1771",
    		name: "Toshiko",
    		image: "images/Empress_Go-Sakuramachi.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$5(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$a, 124, 4, 5484);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$a, 123, 0, 5456);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$5(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$c.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            // console.log(data.map(el => el.uniqueJaartal.value === "1619").filter(e => e)) 

            /**
             * Geeft een array terug met de te matchen jaren
             * 
             * @return {Array}
             */
            const getDates = (dates) => {
                // Check of de/het jaartal(len) die je wilt checken een streepje heeft.
                // Wanneer het een streepje heeft, is het een periode in plaats van een
                // specifiek jaartal
                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    // split de twee jaartallen op het streepje, en cast beide jaartallen
                    // naar een integer, zodat deze later vergeleken kunnen worden met de jaar- 
                    // tallen van de resultaten
                    // Array.map() loopt over alle waarden in de array heen en muteert de waarde (e)
                    // op die plek in de array. Bij deze loop worden whitespaces weggehaald en
                    // van strings dus integers gemaakt
                    // ["100 ", "200"] wordt dan [100, 200]
                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {
                    // Wanneer er geen streepje in het jaartal, moet deze in ieder geval een 
                    // valide getal zijn. isNan() checkt daar op (is Not A Number)
                    // en als het een getal is, cast hij hem naar een getal
                    return [parseInt(dates.trim())];
                }

                // geen jaartal, met of zonder streepje. Someone fucked it up
                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1762 - 1771");

            $$invalidate('filteredData', filteredData = data.filter(el => {
                // zet jaartallen van het artikel in een array, zoals boven beschreven
                const dates = getDates(el.uniqueJaartal.value);
                // Wanneer er geen streepje is
                if (dates.length === 1) {
                    // kijk of de te checken jaartal een streepje heeft
                    return yearToCheck.length === 1 ? 
                        // geen streepje, dan gewoon 1-op-1 checken
                        yearToCheck[0] === dates[0] :
                        // wel een streepje? Dan moet het begin van de te checken periode minder zijn dan 
                        // het jaartal van het artikel, en het einde van de te checken periode meer.
                        // Dus -> "1828 - 1856" filteren -> 1828 is minder dan bijv. 1855 en 1856 is meer, dus 1855 
                        // wordt meegenomen in de filtering
                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {
                    // Check van een periode, aangezien er een streepje zit in het jaartal van het artikel
                    return yearToCheck.length === 1 ? 
                        // er wordt gecheckt op 1 jaartal, dan moet deze binnen de periode liggen van het artikel
                        // dus meer dan de begin van die periode, en minder dan het einde van die periode 
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :
                        // Er zit ee nstreepje in beide jaartallen, dan moeten de jaartallen van de te checken periode
                        // binnen de jaartallen van de periode van het artikelliggen.
                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }
                // wanneer dates.length >= 3 of 0 is, is dit geen valide datum of periode, waardoor 
                // dit artikel sowieso niet meegenomen wordt in de filtering. 
                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Gosakuramachi extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Gosakuramachi", options, id: create_fragment$c.name });
    	}
    }

    /* src/pages/Nakamikado.svelte generated by Svelte v3.12.1 */

    const file$b = "src/pages/Nakamikado.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$6(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$6.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$5(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$5.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$d(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Nakamikado",
    		years: "1709–1735",
    		name: "Yasuhito/Yoshihito",
    		image: "images/Emperor_Nakamikado.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$6(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$b, 99, 4, 2940);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$b, 98, 0, 2912);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$6(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$d.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1709 - 1735");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Nakamikado extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$d, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Nakamikado", options, id: create_fragment$d.name });
    	}
    }

    /* src/pages/Higashiyama.svelte generated by Svelte v3.12.1 */

    const file$c = "src/pages/Higashiyama.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$7(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$7.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$6(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$6.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$e(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Higashiyama",
    		years: "1687–1709",
    		name: "Asahito/Tomohito",
    		image: "images/800px-Emperor_Higashiyama.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$7(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$c, 99, 4, 2946);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$c, 98, 0, 2918);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$7(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$e.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1700 - 1709");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Higashiyama extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$e, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Higashiyama", options, id: create_fragment$e.name });
    	}
    }

    /* src/pages/Kokaku.svelte generated by Svelte v3.12.1 */

    const file$d = "src/pages/Kokaku.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$8(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$8.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$7(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$7.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$f(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Kōkaku",
    		years: "1780–1817",
    		name: "Morohito",
    		image: "images/Emperor_Kōkaku.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$8(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$d, 99, 4, 2923);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$d, 98, 0, 2895);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$8(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$f.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1780 - 1800");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 
     
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Kokaku extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$f, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Kokaku", options, id: create_fragment$f.name });
    	}
    }

    /* src/pages/Komei.svelte generated by Svelte v3.12.1 */

    const file$e = "src/pages/Komei.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (121:12) {:else}
    function create_else_block$9(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$9.name, type: "else", source: "(121:12) {:else}", ctx });
    	return block;
    }

    // (119:8) {#each filteredData as Showdata}
    function create_each_block$8(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$8.name, type: "each", source: "(119:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$g(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Kōmei",
    		years: "1846–1867",
    		name: "Osahito",
    		image: "images/800px-The_Emperor_Komei.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$9(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$e, 117, 4, 5358);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$e, 116, 0, 5330);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$9(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$g.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {
            // Wacht op de data die doorkomt en dan stopt hij het in de lege array genaamd 'data'
            data = await results();

            const getDates = (dates) => {
                // Check of de/het jaartal(len) die je wilt checken een streepje heeft.
                // Wanneer het een streepje heeft, is het een periode in plaats van een
                // specifiek jaartal
                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    // split de twee jaartallen op het streepje, en cast beide jaartallen
                    // naar een integer, zodat deze later vergeleken kunnen worden met de jaar- 
                    // tallen van de resultaten
                    // Array.map() loopt over alle waarden in de array heen en muteert de waarde (e)
                    // op die plek in de array. Bij deze loop worden whitespaces weggehaald en
                    // van strings dus integers gemaakt
                    // ["100 ", "200"] wordt dan [100, 200]
                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {
                    // Wanneer er geen streepje in het jaartal, moet deze in ieder geval een 
                    // valide getal zijn. isNan() checkt daar op (is Not A Number)
                    // en als het een getal is, cast hij hem naar een getal
                    return [parseInt(dates.trim())];
                }

                // geen jaartal, met of zonder streepje. Someone fucked it up
                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1846 - 1867");

            $$invalidate('filteredData', filteredData = data.filter(el => {
                // zet jaartallen van het artikel in een array, zoals boven beschreven
                const dates = getDates(el.uniqueJaartal.value);
                // Wanneer er geen streepje is
                if (dates.length === 1) {
                    // kijk of de te checken jaartal een streepje heeft
                    return yearToCheck.length === 1 ? 
                        // geen streepje, dan gewoon 1-op-1 checken
                        yearToCheck[0] === dates[0] :
                        // wel een streepje? Dan moet het begin van de te checken periode minder zijn dan 
                        // het jaartal van het artikel, en het einde van de te checken periode meer.
                        // Dus -> "1828 - 1856" filteren -> 1828 is minder dan bijv. 1855 en 1856 is meer, dus 1855 
                        // wordt meegenomen in de filtering
                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {
                    // Check van een periode, aangezien er een streepje zit in het jaartal van het artikel
                    return yearToCheck.length === 1 ? 
                        // er wordt gecheckt op 1 jaartal, dan moet deze binnen de periode liggen van het artikel
                        // dus meer dan de begin van die periode, en minder dan het einde van die periode 
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :
                        // Er zit ee nstreepje in beide jaartallen, dan moeten de jaartallen van de te checken periode
                        // binnen de jaartallen van de periode van het artikelliggen.
                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }
                // wanneer dates.length >= 3 of 0 is, is dit geen valide datum of periode, waardoor 
                // dit artikel sowieso niet meegenomen wordt in de filtering. 
                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Komei extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$g, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Komei", options, id: create_fragment$g.name });
    	}
    }

    /* src/pages/Meisho.svelte generated by Svelte v3.12.1 */

    const file$f = "src/pages/Meisho.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$a(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$a.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$9(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$9.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$h(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Empress Meishō",
    		years: "1629–1643",
    		name: "Okiko",
    		image: "images/Meisho_of_Japan.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$a(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$f, 99, 4, 2914);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$f, 98, 0, 2886);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$a(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$h.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1636");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 
     
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Meisho extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$h, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Meisho", options, id: create_fragment$h.name });
    	}
    }

    /* src/pages/Momozono.svelte generated by Svelte v3.12.1 */

    const file$g = "src/pages/Momozono.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$b(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$b.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$a(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$a.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$i(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Momozono",
    		years: "1747–1762",
    		name: "Toohito",
    		image: "images/1280px-Emperor_Momozono.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$b(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$g, 99, 4, 2933);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$g, 98, 0, 2905);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$b(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$i.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1747 - 1762");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 
     
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Momozono extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$i, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Momozono", options, id: create_fragment$i.name });
    	}
    }

    /* src/pages/Ninko.svelte generated by Svelte v3.12.1 */

    const file$h = "src/pages/Ninko.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$c(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$c.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$b(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$b.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$j(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Ninkō",
    		years: "1817–1846",
    		name: "Ayahito",
    		image: "images/Emperor_Ninkō.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$c(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$h, 99, 4, 2927);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$h, 98, 0, 2899);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$c(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$j.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {
            
            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1817 - 1846");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Ninko extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$j, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Ninko", options, id: create_fragment$j.name });
    	}
    }

    /* src/pages/Reigen.svelte generated by Svelte v3.12.1 */

    const file$i = "src/pages/Reigen.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$d(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$d.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$c(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$c.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$k(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Reigen",
    		years: "1663–1687",
    		name: "Satohito",
    		image: "images/Emperor_Reigen.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$d(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$i, 99, 4, 2995);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$i, 98, 0, 2967);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$d(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$k.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {


                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {
                    return [parseInt(dates.trim())];
                }

                // geen jaartal, met of zonder streepje. Someone fucked it up
                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1655 - 1690");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {
                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Reigen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$k, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Reigen", options, id: create_fragment$k.name });
    	}
    }

    /* src/pages/Sakuramachi.svelte generated by Svelte v3.12.1 */

    const file$j = "src/pages/Sakuramachi.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.Showdata = list[i];
    	return child_ctx;
    }

    // (103:12) {:else}
    function create_else_block$e(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$e.name, type: "else", source: "(103:12) {:else}", ctx });
    	return block;
    }

    // (101:8) {#each filteredData as Showdata}
    function create_each_block$d(ctx) {
    	var current;

    	var showdata = new Showdata_1({
    		props: { Showdata: ctx.Showdata },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			showdata.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showdata, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var showdata_changes = {};
    			if (changed.filteredData) showdata_changes.Showdata = ctx.Showdata;
    			showdata.$set(showdata_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showdata.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showdata.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showdata, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$d.name, type: "each", source: "(101:8) {#each filteredData as Showdata}", ctx });
    	return block;
    }

    function create_fragment$l(ctx) {
    	var t, div1, div0, current;

    	var extradata = new Extradata({
    		props: {
    		title: "Emperor Sakuramachi",
    		years: "1735–1747",
    		name: "Teruhito",
    		image: "images/Emperor_Sakuramachi.jpg",
    		description: "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n    \n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do \n    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \n    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo \n    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse \n    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non \n    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	},
    		$$inline: true
    	});

    	let each_value = ctx.filteredData;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$e(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			extradata.$$.fragment.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "cards svelte-e1ainw");
    			add_location(div0, file$j, 99, 4, 2933);
    			attr_dev(div1, "class", "container svelte-e1ainw");
    			add_location(div1, file$j, 98, 0, 2905);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(extradata, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredData) {
    				each_value = ctx.filteredData;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$e(ctx);
    				each_1_else.c();
    				each_1_else.m(div0, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(extradata.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(extradata.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(extradata, detaching);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$l.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	

        let data = [];
        let filteredData = [];

        onMount( async () => {

            data = await results();

            const getDates = (dates) => {

                if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                    return dates.split('-').map(e => parseInt(e.trim()));
                } else if (!isNaN(dates)) {

                    return [parseInt(dates.trim())];
                }

                return [];
            };

            // jaartallen die je wilt checken
            const yearToCheck = getDates("1730 - 1749");

            $$invalidate('filteredData', filteredData = data.filter(el => {

                const dates = getDates(el.uniqueJaartal.value);

                if (dates.length === 1) {

                    return yearToCheck.length === 1 ? 

                        yearToCheck[0] === dates[0] :

                        yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
                } else if (dates.length === 2) {

                    return yearToCheck.length === 1 ? 
     
                        yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                        yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
                }

                return false;
            }));

            console.log(filteredData);
            console.log("test2", filteredData);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) data = $$props.data;
    		if ('filteredData' in $$props) $$invalidate('filteredData', filteredData = $$props.filteredData);
    	};

    	return { filteredData };
    }

    class Sakuramachi extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$l, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Sakuramachi", options, id: create_fragment$l.name });
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		title: 'Cultural insights in the Edo period of Japan'
    	}
    });

    exports.Gokomyo = Gokomyo;
    exports.Gomizunoo = Gomizunoo;
    exports.Gomomozono = Gomomozono;
    exports.Gosai = Gosai;
    exports.Gosakuramachi = Gosakuramachi;
    exports.Higashiyama = Higashiyama;
    exports.Home = Home;
    exports.Kokaku = Kokaku;
    exports.Komei = Komei;
    exports.Meisho = Meisho;
    exports.Momozono = Momozono;
    exports.Nakamikado = Nakamikado;
    exports.Ninko = Ninko;
    exports.Reigen = Reigen;
    exports.Sakuramachi = Sakuramachi;
    exports.default = app;

    return exports;

}({}));
//# sourceMappingURL=bundle.js.map
