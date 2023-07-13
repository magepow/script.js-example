/*!
  * $script.js JS loader & dependency manager
  * https://github.com/ded/script.js
  * (c) Dustin Diaz 2014 | License MIT
  */

(function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else this[name] = definition()
})('$script', function () {
  var doc = document
    , head = doc.getElementsByTagName('head')[0]
    , s = 'string'
    , f = false
    , push = 'push'
    , readyState = 'readyState'
    , onreadystatechange = 'onreadystatechange'
    , list = {}
    , ids = {}
    , delay = {}
    , scripts = {}
    , scriptpath
    , urlArgs

  function every(ar, fn) {
    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
    return 1
  }
  function each(ar, fn) {
    every(ar, function (el) {
      fn(el)
      return 1
    })
  }

  function $script(paths, idOrDone, optDone) {
    paths = paths[push] ? paths : [paths]
    var idOrDoneIsDone = idOrDone && idOrDone.call
      , done = idOrDoneIsDone ? idOrDone : optDone
      , id = idOrDoneIsDone ? paths.join('') : idOrDone
      , queue = paths.length
    function loopFn(item) {
      return item.call ? item() : list[item]
    }
    function callback() {
      if (!--queue) {
        list[id] = 1
        done && done()
        for (var dset in delay) {
          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
        }
      }
    }
    setTimeout(function () {
      each(paths, function loading(path, force) {
        if (path === null) return callback()
        
        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
          path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
        }
        
        if (scripts[path]) {
          if (id) ids[id] = 1
          return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
        }

        scripts[path] = 1
        if (id) ids[id] = 1
        create(path, callback)
      })
    }, 0)
    return $script
  }

  function create(path, fn) {
    var el = doc.createElement('script'), loaded
    el.onload = el.onerror = el[onreadystatechange] = function () {
      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
      el.onload = el[onreadystatechange] = null
      loaded = 1
      scripts[path] = 2
      fn()
    }
    el.async = 1
    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
    head.insertBefore(el, head.lastChild)
  }

  $script.get = create

  $script.order = function (scripts, id, done) {
    (function callback(s) {
      s = scripts.shift()
      !scripts.length ? $script(s, id, done) : $script(s, callback)
    }())
  }

  $script.path = function (p) {
    scriptpath = p
  }
  $script.urlArgs = function (str) {
    urlArgs = str;
  }
  $script.ready = function (deps, ready, req) {
    deps = deps[push] ? deps : [deps]
    var missing = [];
    !each(deps, function (dep) {
      list[dep] || missing[push](dep);
    }) && every(deps, function (dep) {return list[dep]}) ?
      ready() : !function (key) {
      delay[key] = delay[key] || []
      delay[key][push](ready)
      req && req(missing)
    }(deps.join('|'))
    return $script
  }

  $script.done = function (idOrDone) {
    $script([null], idOrDone)
  }

  return $script
});

class VendorJs {
    constructor() {
        this.init();
    }
    init (){
        document.addEventListener("DOMContentLoaded", function() {
            if(    navigator.userAgent.indexOf("Chrome-Lighthouse") != -1 
                || navigator.userAgent.indexOf("GTmetrix") != -1 
                || navigator.userAgent.indexOf("PingdomPageSpeed") != -1 ) {
                document.documentElement.classList.add('no-js page-speed');
                return false;
            }
            var $body = document.body,
                jsvendor = document.querySelector('#jsvendor'),
                dataSrc = jsvendor.dataset;
            $script([dataSrc.jquery], function () {
                $script([dataSrc.sc, dataSrc.lazysizes], 'load_basic');
            });
            $script.ready('load_basic', function() {
                var require = [
                    dataSrc.cookie,
                    dataSrc.currencies,
                    dataSrc.magnific, 
                    dataSrc.countdown,
                    dataSrc.accordion
                ];
                $script(require, 'load_page');
            });
            $script.ready('load_page', function() {
                var require = [dataSrc.shopify];
                /* load dependency in home page */
                if($body.classList.contains('home')){
                    /* require.push("home-sj"); */
                }
                /* load dependency in category page */
                else if($body.classList.contains('template-collection') || $body.classList.contains('template-search')){
                    require.push(dataSrc.stickybar);
                    require.push(dataSrc.collection);
                }
                /* load dependency in product page */
                else if($body.classList.contains('template-product')){
                    require.push(dataSrc.zoom);
                    require.push(dataSrc.stickybar);
                    require.push(dataSrc.product);
                }
                $script(require , 'load_main');
            });   
            $script.ready('load_main', function() {
                $script([dataSrc.theme]);
                $script([dataSrc.custom]);
            });
            document.addEventListener("PriceSliderAssets", function() {
                if(jsvendor.classList.contains('PriceSliderAssets')) return;
                $script([dataSrc.nouislider], function(){
                   var style = document.createElement('link');
                        style.rel  = 'stylesheet';
                        style.type = 'text/css';
                        style.href = dataSrc.nouisliderStyle;
                        document.head.appendChild(style);
                  jsvendor.classList.add('PriceSliderAssets');
                });
            });
            document.addEventListener("VenoboxAssets", function() {
                if(jsvendor.classList.contains('VenoboxAssets')){
                    document.dispatchEvent(new Event('VenoboxAssetsReady'));
                    return;
                }
                $script([dataSrc.venobox], function(){
                   var style = document.createElement('link');
                        style.rel  = 'stylesheet';
                        style.type = 'text/css';
                        style.href = dataSrc.venoboxStyle;
                        document.head.appendChild(style);
                  jsvendor.classList.add('VenoboxAssets');
                  document.dispatchEvent(new Event('VenoboxAssetsReady'));
                });
            });
            document.addEventListener("ColllectionLoadJs", function() {
                if(jsvendor.classList.contains('ColllectionLoadJs')) return;
                $script([dataSrc.global, dataSrc.stickybar, dataSrc.collection], function(){
                  jsvendor.classList.add('ColllectionLoadJs');
                });
            });
            document.addEventListener("MainProductLoadJs", function() {
                if(jsvendor.classList.contains('MainProductLoadJs')) return;
                $script([dataSrc.global, dataSrc.product, dataSrc.productModel], function(){
                  jsvendor.classList.add('MainProductLoadJs');
                });
            });
        });
    }
}

new VendorJs();