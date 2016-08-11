// 템플릿 문자에서 개행문자 제거
export function ts(templateData, ...param) {
  let output = '';
  for (let i = 0; i < param.length; i++) {
    output += templateData[i] + param[i];
  }
  output += templateData[param.length];

  const lines = output.split(/(?:\r\n|\n|\r)/);

  return lines.map(line => line.replace(/^\s+/gm, '')).join(' ').trim();
}
// Generator async
export function async(makeGenerator) {
  return (...args) => {
    const generator = makeGenerator(...args);

    const handle = result => {
      // result => { done: [Boolean], value: [Object] }
      if (result.done) {
        return Promise.resolve(result.value);
      }

      return Promise.resolve(result.value)
        .then(res => handle(generator.next(res)))
        .catch(err => handle(generator.throw(err)));
    };

    try {
      return handle(generator.next());
    } catch (ex) {
      return Promise.reject(ex);
    }
  };
}
// Generator async wrap
export function wrap(fn) {
  return (...args) => fn(...args).catch(args[2]);
}
