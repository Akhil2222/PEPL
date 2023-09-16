const fs = require('fs')
const crypto = require('crypto');
const prompt = require('prompt-sync')()
const process = require('process')
const filename = process.argv[2]
const returnName = crypto.createHash('sha256', filename).update('return').digest('hex')
const extensionAdd = crypto.createHash('sha256', filename).update('+std').digest('hex')
const extensionRemove = crypto.createHash('sha256', filename).update('-std').digest('hex')
// Rule #1 - Any empty array will reference the other array's type. If both arrays are blank, or the operator uses one array, the default value will be an integer
// Rule #2 - Any variable can be overriden with a new type.
// Rule #3 - There is no spaces required between operators
// Rule #4 - You can name your variables after a type, but the syntax highlighting will be trash
class arr {
  constructor(type, val) {
    this.type = type;
    this.subtype = type.slice(0, -2);
    this.base = "arr";

    let arrind = 0;
    let str = ""
    let evaled = [];
    let isInQuotes = false;
    if (val == "[]" || val == "") {
      this.val = [];
    } else {
      for (let i = 1; i < val.length - 1; i++) {
        if (val[i] == '[') {
          arrind++;
        } else if (val[i] == "]") {
          arrind--;
        }
        if (val[i] == '"' && val[i - 1] != '\\') {
          isInQuotes = !isInQuotes;
        }
        if (val[i] == ',' && arrind == 0 && !isInQuotes) {
          if (checkType(str, this.subtype).type != this.subtype) {
            throw new TypeError("Multiple types in array")
          }
          evaled.push(getType(this.subtype)(str))
          str = "";
        } else {
          str += val[i]
        }
      }
      if (checkType(str, this.subtype).type != this.subtype) {
        throw new TypeError("Multiple types in array")
      }
      evaled.push(getType(this.subtype)(str))
      this.val = evaled
    }
  }
  toString() {
    if (this.val.length == 0) {
      return '[]'
    }
    let str = '['
    for (let i of this.val) {
      str += i.toString();
      str += ','
    }
    return str.slice(0, -1) + ']'
  }
}
class integer {
  constructor(val) {
    this.type = "int"
    this.base = "int"
    this.val = Number(val);
  }
  toString() {
    return String(this.val)
  }

}
class string {
  constructor(val) {
    this.type = "string"
    this.base = "string"
    if (val == "") {
      this.val = ""
    } else {
      this.val = val.slice(1, -1);
    }
  }
  toString() {
    return `"${this.val}"`
  }
}
class float {
  constructor(val) {
    this.type = "float"
    this.base = "float"
    if (val == "") {
      this.val = 0;
    } else {
      this.val = Math.round(Number(val.at(-1) == "f" ? val.slice(0, -1) : val) * 1e+15) / 1e+15
    }
  }
  toString() {
    let holdstr = String(this.val)
    if (holdstr.indexOf('.') == -1) {
      holdstr += 'f'
    }
    return holdstr
  }
}
class bool {
  constructor(val) {
    this.type = "bool"
    this.base = "bool"
    this.val = (val == "true")
  }
  toString() {
    return this.val ? "true" : "false";
  }
}
class reference {
  constructor(name, type) {
    if (name.match(/[a-zA-Z]+[0-9]?/)) {
      if (name.match(/[a-zA-Z]+[0-9]?/g)[0] == name) {
        this.type = type
        this.base = "ref"
        this.value = getType(type)("")
        variables[extension.join('') + name] = this;
      } else {
        throw new SyntaxError(`${name} does not follow variable rules`)
      }
    } else {
      throw new SyntaxError(`${name} does not follow variable rules`)
    }

  }
  set(val) {
    this.value = getType(this.type)(val)
  }
}
class subref {
  constructor(ref, ind) {
    let hash = crypto.createHash('sha256', filename)
    this.ref = checkType(ref);
    this.base = 'ref'
    this.type = this.ref.value.val[0].type;
    this.ind = ind;
    this.value = this.ref.value.val[ind];
    this.name = hash.update(`${ref}[${ind}]`).digest(`hex`).split('').map(a => map[parseInt(a, 16)]).join('')
    variables[this.name] = this;
    temps.push(this.name);
  }
  set(val) {
    this.value = getType(this.type)(val)
  }
}
class func {
  constructor(type, name, params, cmds) {
    this.type = type
    this.name = extension.join('') + name
    this.mainExtension = structuredClone(extension)
    this.params = []
    if (params != '') {
      let par = params.split(',')
      for (let i of par) {
        let parts = i.split(' ').filter(a => a)
        if (parts.length != 2) {
          throw SyntaxError('Invalid Syntax')
        }
        this.params.push({
          'type': parts[0],
          'varname': parts[1]
        })
      }
    }
    this.cmds = cmds.split('\n').filter(a => a)
    functions[this.name] = this
  }
  run(params) {
    let currext = crypto.createHash('sha256', filename).update(this.name).digest('hex').split('').map(a => map[parseInt(a, 16)]).join('')
    let hisInBlock = structuredClone(isInBlock)
    let hkeyWordsCalled = structuredClone(keyWordsCalled)
    keyWordsCalled = structuredClone(dkeyWordsCalled)
    isInBlock = structuredClone(disInBlock)
    isInBlock['function']++;
    for(let i = 0;i < this.mainExtension.length;i++){
      extension.push(this.mainExtension[i])
    }
    extension.push(currext);
    let str = '';
    let arrind = 0;
    let evaled = []
    let c = 0;
    let isInQuotes = false
    if (params != '{}') {
      for (let i = 1; i < params.length - 1; i++) {
        if (params[i] == '[') {
          arrind++;
        } else if (params[i] == "]") {
          arrind--;
        }
        if (params[i] == '"' && params[i - 1] != '\\') {
          isInQuotes = !isInQuotes;
        }
        if (params[i] == ',' && arrind == 0 && !isInQuotes) {
          if (!this.params[c]) {
            throw new RangeError("Too many arguments")
          }
          if (checkType(str, this.params[c].type).type != this.params[c].type) {
            throw new TypeError("Wrong parameter type")
          }
          evaled.push(getType(this.params[c].type)(str))
          str = "";
          c++
        } else {
          str += params[i]
        }
      }
      if (checkType(str, this.params[c].type).type != this.params[c].type) {
        throw new TypeError("Wrong parameter type")
      }
      evaled.push(getType(this.params[c].type)(str))
      this.val = evaled
      for (let i in this.params) {
        new reference(this.params[i].varname, this.params[i].type)
        bin_oper['='](this.params[i].varname, evaled[i].toString())
      }
    }
    for (let i of this.cmds) {
      compile(i)
      if (keyWordsCalled[returnName].called) {
        break;
      }
    }
    let retval = keyWordsCalled[returnName].returned
    if (this.type == 'void' && retval != null) {
      throw new TypeError(`Returned ${retval.type} in a void function`)
    } else if (retval == null && this.type != 'void') {
      throw new TypeError("Returned nothing in a " + this.type + "function")
    } else if (this.type == 'void' && retval == null) {

    } else if (retval.type != this.type) {
      throw new TypeError(`Returned ${retval.type} in a ${this.type} function`)
    }
    for (let i in variables) {
      if (i.search(extension.join('')) == 0) {
        variables[i] = undefined
      }
    }
    keyWordsCalled = hkeyWordsCalled
    isInBlock = hisInBlock
    extension.pop()
    if (retval == null) return '';
    return retval
  }
}
function checkType(val, crossType) {
  val = val.replace(/^ */, '');
  val = val.replace(/ *$/, '');

  if (val.match(/-?\d*/) == val) {
    return new integer(val)
  } else if (val[0] == "[" && val.at(-1) == "]") {
    if (val == '[]') {
      if (!crossType) {
        return new arr('int[]', '[]')
      }

      return new arr(crossType, '[]')
    }
    let str = ''
    let ind = 0
    let isInQuotes = false;
    for (let i = 1; !((val[i] == ',' || val[i] == ']') && (ind == 0) && !isInQuotes); i++) {
      str += val[i]
      if (val[i] == '[') ind++
      else if (val[i] == ']') ind--;
      else if (val[i] == '"') isInQuotes = !isInQuotes
    }
    return new arr(checkType(str).type + '[]', val)
  } else if (val.match(/"([^"]|(\\"))*[^\\]"|""/)) {
    if (val.match(/"([^"]|(\\"))*[^\\]"|""/g)[0] == val) {
      return new string(val)
    }
  } else if (val == "true" || val == "false") {
    return new bool(val);
  } else if (val.match(/-?\d*(f|\.\d*)/g)) {
    if (val.match(/-?\d*(f|\.\d*)/g)[0] == val) {
      return new float(val)
    }
  } else if (variables[extension.join('') + val] != undefined) {
    return variables[extension.join('') + val]
  } else if (val.match(/\[-?\d*\]$/m)) {
    let slice = val.replace(val.match(/\[-?\d*\]$/m), '');
    let ind = Number(val.match(/\[-?\d*\]$/gm)[0].slice(1, -1))
    if (variables[extension.join('') + slice]) {
      slice = extension.join('') + slice
    }
    if (variables[slice].type.slice(-2) == "[]") {
      let len = variables[slice].value.val.length
      if (ind >= len) {
        throw new RangeError(`${ind} not in reference "${slice}"`)
      }
      ind = ((ind + len) % len + len) % len
      let name = new subref(slice, ind);
      return variables[name.name]
    }
  }
  let extense = structuredClone(extension)
  while(extense.length >= 0){
    if(variables[extense.join('') + val]){
      return variables[extense.join('') + val]
    }
    extense.pop()
  }
  throw new SyntaxError("Invalid syntax: " + val);
}
function getType(type) {
  if (type == "int") {
    return ((val) => new integer(val))
  } else if (type.slice(type.length - 2, type.length) == "[]") {
    return ((val) => new arr(type, val))
  } else if (type == "string") {
    return ((val) => new string(val))
  } else if (type == "bool") {
    return ((val) => new bool(val))
  } else if (type == "float") {
    return ((val) => new float(val))
  } else if (type == "void") {
    return (() => { throw new TypeError(`Cannot use void type as a variable`) });
  }
  throw new SyntaxError("No type found: " + type)
}
let unary_oper = {
  // Increment
  '++': function(a) {
    a = checkType(a)
    if (a.base = "ref") {
      if (a.type == "int" || a.type == "float") {
        a.value = bin_oper['+'](a.value.toString(), '1')
        return a.value
      }
      throw new TypeError(`${a.type} cannot be incremented`)
    }
    throw new TypeError(`${a.name} is not a reference`)
  },
  // Decrement
  '--': function(a) {
    a = checkType(a)
    if (a.base = "ref") {
      if (a.type == "int" || a.type == "float") {
        a.value = bin_oper['-'](a.value.toString(), '1')
        return a.value
      }
      throw new TypeError(`${a.type} cannot be decremented`)
    }
    throw new TypeError(`${a.name} is not a reference`)
  },
  // Value-force (Returns the value of the reference, good for arrays)
  '?': function(a) {
    a = checkType(a);
    if (a.base == 'ref') {
      return a.value
    }
  },
  // Output
  '<<': function(a) {
    a = checkType(a)
    if (a.base == 'ref') {
      a = a.value
    }
    let string = a.toString()
    if (string[0] == '"') {
      string = string.slice(1, -1)
    }
    while (string.match(/\\./g)) {
      let match = string.match(/\\./g)[0]
      string = string.replace(match, eval(`"${match}"`))
    }
    console.log(string)
    return '';
  },
  '>>': function(a) {
    a = checkType(a);
    if (a.type != 'string') {
      throw new TypeError(`Reference is not a string`)
    }
    if (a.base == 'ref') {
      let str = prompt('')
      str = str.replaceAll('"', '\\"');
      a.value = new string(`"${str}"`)
      return a.value
    }
    throw new TypeError(`Not a reference`)
  },
  // NOT (Bitwise)
  '~': function(a) {
    a = checkType(a)
    if (a.base == 'ref') {
      a = a.value
    }
    if (a.type == 'int') {
      if (a.val < 0) {
        throw new RangeError("Cannot NOT " + a.val)
      }
      let bin = a.val.toString(2);
      let num = 0;
      let counter = 0;
      for (let i = bin.length - 1; i >= 0; i--) {
        num += Math.pow(2, counter) * (bin[i] == '0')
        counter++;
      }
      return new integer(String(num))
    }
    if (a.type == 'float') {
      if (a.val < 0) {
        throw new RangeError("Cannot Bit-NOT " + a.val)
      }
      let bin = (a.val).toString(2);
      let dot = bin.indexOf('.')
      let num = 0;
      for (let i = 1; i < bin.length; i++) {
        if (bin[dot - i]) {
          num += Math.pow(2, i - 1) * (bin[dot - i] == '0')
        }
        if (bin[dot + i]) {
          num += Math.pow(2, -i) * (bin[dot + i] == '0')
        }
        if (!bin[dot + i] && !bin[dot - i]) {
          break;
        }
      }
      return new float(String(num))
    }
    throw new TypeError(`Cannot Bit-NOT ${a.type}`)
  },
  '!': function(a) {
    a = checkType(a)
    if (a.base == 'ref') {
      a = a.value
    }
    if (a.type == 'bool') {
      return new bool(String(!a.val))
    }
    throw new Error(`Cannot Bool-NOT ${a.type}`)
  },
  '=>': function(a) {
    a = checkType(a);
    if (a.base == 'ref') {
      a = a.value
    }
    if (!isInBlock['function']) {
      throw new SyntaxError("Called return not in a function")
    }
    keyWordsCalled[returnName].called = true
    keyWordsCalled[returnName].returned = a
    return ''
  },
  '#': function(a) {
    a = checkType(a)
    if (a.base == 'ref') {
      a = a.value
    }
    if (a.type == 'string' || a.base == "arr") {
      return new integer(String(a.val.length))
    }
    throw new TypeError(`Cannot get length of ${a.type}`)
  },
  [extensionAdd]: function(a) {
    extension.push(`${a}.`)
    return ''
  },
  [extensionRemove]: function(a) {
    extension.pop()
    return ''
  }
}
let bin_oper = {
  // Type specifier
  ':': function(a, b) {
    new reference(a, b)
    return a
  },
  // Assignment
  '=': function(a, b) {
    let varname = checkType(a);
    let type = checkType(b, varname.type);
    if (varname.base != 'ref') {
      throw new SyntaxError("Assigning value to non-reference")
    }
    if (type.base == 'ref') {
      type = type.value;
    }
    if (type.type == varname.type) {
      varname.set(type.toString())
    } else {
      throw new TypeError(`${checkType(b, varname.type).type} is not ${varname.type}`)
    }
    return b;
  },
  // Cast
  '->': function(a, b) {
    a = checkType(a);
    if (a.base == 'ref') {
      a = a.value
    }
    if (b == 'int') {
      if (a.base == 'string') {
        let holdnum = Number(a.val)
        if (isNaN(holdnum)) {
          throw new TypeError(`String ${a.val} cannot be converted to int`);
        } else if (Math.floor(holdnum) != holdnum) {
          throw new TypeError(`String ${a.val} cannot be converted to int`);
        }
        return new integer(a.val);
      } else if (a.base == 'float') {
        return new integer(String(Math.round(a.val)));
      } else if (a.base == 'bool') {
        return new integer(a.val ? '1' : '0')
      }
    }
    if (b == 'float') {
      if (a.base == 'string') {
        let holdnum = Number(a.val)
        let possfloat = Number(a.val.slice(0, -1))
        if (isNaN(holdnum) && isNaN(possfloat)) {
          throw new TypeError(`String ${a.val} cannot be converted to float`);
        } else if (Math.floor(possfloat) == possfloat && a.val.at(-1) != 'f') {
          throw new TypeError(`String ${a.val} cannot be converted to float`);
        }
        return new float(a.val);
      } else if (a.base == 'int') {
        return new float(String(a.val) + 'f');
      } else if (a.base == 'bool') {
        return new float(a.val ? '1f' : '0f')
      }
    }
    if (b == 'string') {
      return new string(`"${a.toString()}"`)
    }
    if (b == 'bool') {
      return new bool(Boolean(a.val).toString())
    }
    throw new TypeError(`Cannot cast ${a.type} into ${b}`)
  },
  // Equals to
  '==': function(a, b) {
    a = checkType(a, checkType(b).type)
    b = checkType(b, a.type)
    if (a.base == 'ref') {
      a = a.value
    } else if (b.base == 'ref') {
      b = b.value
    }
    if (a.type == b.type) {
      if (a.base != 'arr') {
        return new bool(String(a.val == b.val))
      } else if (a.base == 'arr') {
        let istrue = true;
        if (a.val.length != b.val.length) {
          return new bool('false')
        }
        for (let i = 0; i < a.val.length; i++) {
          let trfl = bin_oper['=='](a.val[i].toString(), b.val[i].toString())
          istrue &&= trfl.val
          if (!istrue) {
            break;
          }
        }
        return new bool(String(istrue));
      }
    }
    return new bool('false')
  },
  // Not equal to
  '!=': function(a, b) {
    return new bool(String(!bin_oper['=='](a, b).val))
  },
  // Greater than
  '>': function(a, b) {
    a = checkType(a, checkType(b).type)
    b = checkType(b, a.type)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (a.type == b.type) {
      if (a.base != 'arr') {
        return new bool(String(a.val > b.val))
      } else {
        for (let i = 0; i < a.val.length; i++) {
          if (!b.val[i]) {
            return new bool('true')
          }
          let trufalse = bin_oper['>'](a.val[i].toString(), b.val[i].toString())
          if (trufalse.val) {
            return new bool('true')
          }
          trufalse = bin_oper['>'](b.val[i].toString(), a.val[i].toString())
          if (trufalse.val) {
            return new bool('false')
          }
        }
        return new bool('false')
      }
    }
    throw new TypeError(`Cannot compare ${a.type} with ${b.type}`)
  },
  // Less than
  '<': function(a, b) {
    return bin_oper['>'](b, a)
  },
  // Less than or equal to
  '<=': function(a, b) {
    let fstval = bin_oper['>'](b, a)
    let secval = bin_oper['=='](b, a)
    return new bool(String(fstval.val || secval.val))
  },
  // Greater than or equal to
  '>=': function(a, b) {
    let fstval = bin_oper['>'](a, b)
    let secval = bin_oper['=='](a, b)
    return new bool(String(fstval.val || secval.val))
  },
  // Conditional AND
  '&&': function(a, b) {
    a = checkType(a)
    b = checkType(b)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (a.type == 'bool' && b.type == 'bool') {
      return new bool(String(a.val && b.val))
    }
    throw new Error(`Cannot Bool-AND ${a.type}`)
  },
  // Conditional OR
  '||': function(a, b) {
    a = checkType(a)
    b = checkType(b)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (a.type == 'bool' && b.type == 'bool') {
      return new bool(String(a.val || b.val))
    }
    throw new Error(`Cannot Bool-OR ${a.type}`)
  },
  // Left Shift
  '<<': function(a, b) {
    a = checkType(a)
    b = checkType(b)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (b.type == 'int') {
      if (b.val < 0) {
        throw new RangeError(`${b.val} is not suitable for left-shift`)
      }
      if (a.type == 'int') {
        return new integer(String(a.val * Math.pow(2, b)))
      } else if (a.type == 'float') {
        return new float(String(a.val * Math.pow(2, b)))
      } else if (a.base == 'arr') {
        let holdarr = new arr(a.type, '[]')
        for (let i = 0; i < a.val.length; i++) {
          holdarr.val.push(a.val[(i + b.val) % a.val.length])
        }
        return holdarr
      }
    }
    throw new TypeError(`Cannot left-shift ${a.type} and ${b.type}`)
  },
  // Right-shift
  '>>': function(a, b) {
    a = checkType(a)
    b = checkType(b)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (b.type == 'int') {
      if (b.val < 0) {
        throw new RangeError(`${b.val} is not suitable for right-shift`)
      }
      if (a.type == 'int') {
        return new integer(String(Math.floor(a.val * Math.pow(2, -b))))
      } else if (a.type == 'float') {
        return new float(String(a.val * Math.pow(2, -b)))
      } else if (a.base == 'arr') {
        let holdarr = new arr(a.type, '[]')
        for (let i = 0; i < a.val.length; i++) {
          holdarr.val.push(a.val[((i - b.val) + a.val.length) % a.val.length])
        }
        return holdarr
      }
    }
    throw new TypeError(`Cannot right-shift ${a.type} and ${b.type}`)
  },
  // Instance Check (is a of type b)
  '?=': function(a, b) {
    a = checkType(a)
    return new bool(String(a.type == b))
  },
  // Exponents
  '**': function(a, b) {
    a = checkType(a)
    b = checkType(b)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (a.type == 'int' && b.type == 'int') {
      return new integer(String(Math.pow(a.val, b.val)))
    } else if ((a.type == 'float' && b.type == 'int') || (b.type == 'float' && a.type == 'int')) {
      return new float(String(Math.pow(a.val, b.val)))
    }
  },
  // String & Array location search (returns value instead of referencing value)
  '$': function(a, b) {
    a = checkType(a)
    b = checkType(b)
    if (a.base == 'ref') {
      a = a.value
    }
    if (b.base == 'ref') {
      b = b.value
    }
    if (a.type == 'string' && b.type == 'int') {
      let holdstr = ''
      if (b.val < 0) {
        b.val += a.val.length
      }
      if (b.val < 0) {
        throw new RangeError(`${b.val} out of range for ${a.toString()}`)
      }
      if (a.val[b.val - 1] == '\\') {
        holdstr += a.val[b.val - 1]
      }
      holdstr += a.val[b.val]
      if (a.val[b.val] == '\\') {
        holdstr += a.val[b.val + 1]
      }
      return new string(`"${holdstr}"`)
    } else if (a.base == 'arr' && b.type == 'int') {
      if (b.val < 0) {
        b.val += a.val.length
      }
      if (b.val < 0) {
        throw new RangeError(`${b.val} out of range for ${a.toString()}`)
      }
      return getType(a.subtype)(a.val[b.val].toString())
    }
    throw new TypeError(`Cannot get element of type ${a.type} with index ${b.type}`)
  }
}
let bin_oper_mut = {
  //Addition and Concatenation
  '+': function(a, b) {
    a = checkType(a, checkType(b).type);
    b = checkType(b, a.type);

    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }
    if (a.type == b.type) {
      if (a.base == "int") {
        return new integer(String(a.val + b.val))
      } else if (a.base == "string") {
        return new string('"' + a.val + b.val + '"')
      } else if (a.base == "bool") {
        throw new TypeError(`Invalid arguments: ${a.type}, ${b.type}`);
      } else if (a.base == "float") {
        return new float(String(a.val + b.val))
      } else if (a.base == "arr") {
        let holdarr = new arr(a.type, "[]")
        holdarr.val = holdarr.val.concat(a.val);
        holdarr.val = holdarr.val.concat(b.val);
        return holdarr
      }
    }
    if ((a.type == 'float' && b.type == 'int') || (b.type == 'float' && a.type == 'int')) {
      return new float(String(a.val + b.val))
    }
    throw new TypeError(`Cannot add types ${a.type} and ${b.type}`)
  },
  // Multiplication/Repeated Concatenation
  '*': function(a, b) {
    a = checkType(a);
    b = checkType(b);

    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }

    if (b.type == 'int') {
      if (a.base == "int") {
        return new integer(String(a * b))
      } else if (a.base == "string") {
        if (a.val < 0) {
          throw new TypeError("Cannot multiply string by negative number")
        }
        return new string(`"${a.val.repeat(b.val)}"`)
      } else if (a.base == "float") {
        return new float(String(a.val * b.val))
      } else if (a.base == "bool") {
        throw new TypeError(`Invalid arguments: ${a.type}, ${b.type}`)
      } else if (a.base == "arr") {
        let holdarr = new arr(a.type, "[]");
        if (b.val < 0) {
          throw new TypeError("Cannot multiply array by negative number")
        }
        for (let i = 0; i < b.val; i++) {
          holdarr.val = holdarr.val.concat(a.val)
        }
        return holdarr
      }
    }
    if (b.type == 'float') {
      if (a.type == "int") {
        return new float(String(a.val * b.val))
      } else if (a.type == "float") {
        return new float(String(a.val * b.val))
      }
    }
    throw new TypeError(`Invalid arguments: ${a.type}, ${b.type}`)
  },
  // Subtraction or removal
  '-': function(a, b) {
    a = checkType(a, checkType(b).type + '[]')
    b = checkType(b, a.subtype)
    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }
    if ((a.type == "int" && b.type == "float") ||
      (a.type == "float" && b.type == "int") ||
      (a.type == "float" && b.type == "float")) {
      return new float(String(a.val - b.val))
    } else if (a.type == "int" && b.type == "int") {
      return new integer(String(a.val - b.val))
    }
    if (a.type == "string" && b.type == "string") {
      return new string(`"${a.val.replace(b.val, '')}"`)
    } else if (a.base == 'arr' && b.type == a.subtype) {
      let holdarr = new arr(a.type, a.toString());
      let notgood = -1;
      for (let i = 0; i < holdarr.val.length; i++) {
        if (bin_oper['=='](holdarr.val[i].toString(), b.toString()).val) {
          notgood = i;
          break;
        }
      }
      holdarr.val = holdarr.val.filter((a, b) => b != notgood);
      return holdarr;
    }
    throw new TypeError(`Cannot subtract ${b.type} from ${a.type}`)
  },
  // Division
  '/': function(a, b) {
    a = checkType(a)
    b = checkType(b);
    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }
    if (a.type == 'int' && b.type == 'int') {
      return new integer(String(Math.round(a.val / b.val)))
    } else if ((a.type == 'float' || a.type == 'int') || (b.type == 'int' && b.type == 'float')) {
      return new float(String(a.val / b.val))
    }
    throw new TypeError(`Cannot divide ${b.type} from ${a.type}`)
  },
  // Modulous
  '%': function(a, b) {
    a = checkType(a)
    b = checkType(b);
    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }
    if (a.type == 'int' && b.type == 'int') {
      return new integer(String(a.val % b.val))
    } else if ((a.type == 'float' || a.type == 'int') || (b.type == 'int' && b.type == 'float')) {
      return new float(String(a.val % b.val))
    }
    throw new TypeError(`Cannot divide ${b.type} from ${a.type}`)
  },
  //XOR (Bitwise)
  '^': function(a, b) {
    a = checkType(a);
    b = checkType(b);

    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }

    if (a.type == 'int' && b.type == 'int') {
      let abin = a.val.toString(2)
      let bbin = b.val.toString(2);
      while (abin.length != bbin.length) {
        if (bbin.length > abin.length) {
          abin = '0' + abin
        } else if (bbin.length < abin.length) {
          bbin = '0' + bbin
        }
      }
      if (a.val < 0 || b.val < 0) {
        throw new RangeError(`Cannot Bit-XOR ${a.val} and ${b.val}`)
      }
      let num = 0;
      let counter = 0;
      for (let i = abin.length - 1; i >= 0; i--) {
        num += Math.pow(2, counter) * (Number(abin[i]) ^ Number(bbin[i]))
        counter++;
      }
      return new integer(String(num))
    } else {
      if ((a.type == 'float' || a.type == 'int') || (b.type == 'float' || b.type == 'int')) {
        if (a.val < 0 || b.val < 0) {
          throw new RangeError(`Cannot Bit-XOR ${a.val} and ${b.val}`)
        }
        let abin = (a.val).toString(2);
        let adot = abin.indexOf('.')
        let bbin = (b.val).toString(2)
        let bdot = bbin.indexOf('.');
        if (bdot == -1) {
          bdot = bbin.length
        }
        if (adot == -1) {
          adot == abin.length
        }
        let len = Math.max(abin.length, bbin.length)
        let num = 0;
        for (let i = 1; i < len; i++) {
          if (abin[adot - i] || bbin[bdot - i]) {
            num += Math.pow(2, i - 1) * (Number(abin[adot - i]) ^ Number(bbin[bdot - i]))
          }
          if (abin[adot + i] || bbin[bdot + i]) {
            num += Math.pow(2, -i) * (Number(abin[adot + i]) ^ Number(bbin[bdot + i]))
          }
          if ((!abin[adot + i] && !abin[adot - i]) || !(bbin[bdot + i] || bbin[bdot - i])) {
            break;
          }
        }
        return new float(String(num))
      }
    }
    throw new TypeError(`Cannot Bit-XOR ${a.type} and ${b.type}`)
  },
  // Bitwise - AND
  '&': function(a, b) {
    a = checkType(a);
    b = checkType(b);

    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }

    if (a.type == 'int' && b.type == 'int') {
      let abin = a.val.toString(2)
      let bbin = b.val.toString(2);
      while (abin.length != bbin.length) {
        if (bbin.length > abin.length) {
          abin = '0' + abin
        } else if (bbin.length < abin.length) {
          bbin = '0' + bbin
        }
      }
      if (a.val < 0 || b.val < 0) {
        throw new RangeError(`Cannot Bit-AND ${a.val} and ${b.val}`)
      }
      let num = 0;
      let counter = 0;
      for (let i = abin.length - 1; i >= 0; i--) {
        num += Math.pow(2, counter) * (Number(abin[i]) & Number(bbin[i]))
        counter++;
      }
      return new integer(String(num))
    } else {
      if ((a.type == 'float' || a.type == 'int') || (b.type == 'float' || b.type == 'int')) {
        if (a.val < 0 || b.val < 0) {
          throw new RangeError(`Cannot Bit-AND ${a.val} and ${b.val}`)
        }
        let abin = (a.val).toString(2);
        let adot = abin.indexOf('.')
        let bbin = (b.val).toString(2)
        let bdot = bbin.indexOf('.');
        if (bdot == -1) {
          bdot = bbin.length
        }
        if (adot == -1) {
          adot == abin.length
        }
        let len = Math.max(abin.length, bbin.length)
        let num = 0;
        for (let i = 1; i < len; i++) {
          if (abin[adot - i] || bbin[bdot - i]) {
            num += Math.pow(2, i - 1) * (Number(abin[adot - i]) & Number(bbin[bdot - i]))
          }
          if (abin[adot + i] || bbin[bdot + i]) {
            num += Math.pow(2, -i) * (Number(abin[adot + i]) & Number(bbin[bdot + i]))
          }
          if ((!abin[adot + i] && !abin[adot - i]) || !(bbin[bdot + i] || bbin[bdot - i])) {
            break;
          }
        }
        return new float(String(num))
      }
    }
    throw new TypeError(`Cannot Bit-AND ${a.type} and ${b.type}`)
  },
  // Bitwise - OR
  '|': function(a, b) {
    a = checkType(a);
    b = checkType(b);

    if (a.base == "ref") {
      a = a.value
    }
    if (b.base == "ref") {
      b = b.value
    }

    if (a.type == 'int' && b.type == 'int') {
      let abin = a.val.toString(2)
      let bbin = b.val.toString(2);
      while (abin.length != bbin.length) {
        if (bbin.length > abin.length) {
          abin = '0' + abin
        } else if (bbin.length < abin.length) {
          bbin = '0' + bbin
        }
      }
      if (a.val < 0 || b.val < 0) {
        throw new RangeError(`Cannot Bit-OR ${a.val} and ${b.val}`)
      }
      let num = 0;
      let counter = 0;
      for (let i = abin.length - 1; i >= 0; i--) {
        num += Math.pow(2, counter) * (Number(abin[i]) | Number(bbin[i]))
        counter++;
      }
      return new integer(String(num))
    } else {
      if ((a.type == 'float' || a.type == 'int') || (b.type == 'float' || b.type == 'int')) {
        if (a.val < 0 || b.val < 0) {
          throw new RangeError(`Cannot Bit-OR ${a.val} and ${b.val}`)
        }
        let abin = (a.val).toString(2);
        let adot = abin.indexOf('.')
        let bbin = (b.val).toString(2)
        let bdot = bbin.indexOf('.');
        if (bdot == -1) {
          bdot = bbin.length
        }
        if (adot == -1) {
          adot == abin.length
        }
        let len = Math.max(abin.length, bbin.length)
        let num = 0;
        for (let i = 1; i < len; i++) {
          if (abin[adot - i] || bbin[bdot - i]) {
            num += Math.pow(2, i - 1) * (Number(abin[adot - i]) | Number(bbin[bdot - i]))
          }
          if (abin[adot + i] || bbin[bdot + i]) {
            num += Math.pow(2, -i) * (Number(abin[adot + i]) | Number(bbin[bdot + i]))
          }
          if ((!abin[adot + i] && !abin[adot - i]) || !(bbin[bdot + i] || bbin[bdot - i])) {
            break;
          }
        }
        return new float(String(num))
      }
    }
    throw new TypeError(`Cannot Bit-OR ${a.type} and ${b.type}`)
  },
}
let variables = {

}
let functions = {

}
let commands = {

}
let isInBlock = {
  'while': 0,
  'function': 0
}
let keyWordsCalled = {
  'break': {
    'base': 'while',
    'called': false
  },
  'continue': {
    'base': 'while',
    'called': false
  },
  [returnName]: {
    'base': '',
    'called': false,
    'returned': null
  }
}
let disInBlock = structuredClone(isInBlock)
let dkeyWordsCalled = structuredClone(keyWordsCalled)
let extension = [];
let map = "abcdefghijklmnop"
let temps = []
function removeTemps() {
  for (let i = 0; i < temps.length; i++) {
    let temp = variables[temps[i]]
    temp.ref.value.val[temp.ind] = temp.value
    variables[temps[i]] = undefined;
  }
  temps = []
}
function evalCommands({ name, params, cmds }) {
  if (name == 'if') {
    let val = checkType(compile(params))
    if (val.val && val.type == 'bool') {
      let comp = cmds.split('\n').filter(a => a)
      for (let i = 0; i < comp.length; i++) {
        compile(comp[i])
        if (keyWordsCalled['break'].called) {
          return;
        } else if (keyWordsCalled['continue'].called) {
          return;
        } else if (keyWordsCalled[returnName].called) {
          return;
        }
      }
    }
  } else if (name == 'while') {
    isInBlock['while']++
    let comp = cmds.split('\n').filter(a => a)
    let val = checkType(compile(params))
    while (val.val && val.type == 'bool') {
      for (let i = 0; i < comp.length; i++) {
        compile(comp[i])
        if (keyWordsCalled['break'].called) {
          isInBlock['while']--;
          keyWordsCalled['break'].called = false;
          return;
        } else if (keyWordsCalled['continue'].called) {
          keyWordsCalled['continue'].called = false
          break;
        } else if (keyWordsCalled[returnName].called) {
          isInBlock['while']--;
          return;
        }
      }
      val = checkType(compile(params))
    }
    isInBlock['while']--
  } else if (typeof getType(name.split(' ')[0]) == 'function') {
    let type = name.split(' ')[0]
    let funcname = name.split(' ')[1]
    new func(type, funcname, params, cmds)
  }
}
function compile(inp) {
  line = inp
  if (commands[inp] != undefined) {
    evalCommands(commands[inp])
    return;
  }
  if (keyWordsCalled[inp]?.called == false) {
    let base = keyWordsCalled[inp].base
    if (base) {
      keyWordsCalled[inp].called = true
      return;
    } else {
      throw new SyntaxError(`${inp} is not called in ${base}`)
    }
  }
  while (inp.match(/\([^()]*\)/)) {
    let match = inp.match(/\([^()]*\)/g)[0];
    let exp = match.slice(1, -1);
    let change = false
    for (let i = 0; i < exp.length; i++) {
      if (unary_oper[exp.slice(0, i + 1)] && !unary_oper[exp.slice(0, i + 2)]) {
        inp = inp.replace(match, unary_oper[exp.slice(0, i + 1)](exp.slice(i + 1)).toString())
        removeTemps()
        change = true
      } else if (functions[exp.slice(0, i + 1)] && exp[i + 1] == '{') {
        inp = inp.replace(match, functions[exp.slice(0, i + 1)].run(exp.slice(i + 1)).toString())
      }
    }
    if (change) continue;
    let inQuote = false;
    let shiftQuote = false;
    let shiftingstr = ""
    for (let i = 0; i < exp.length + 1; i++) {
      if (i > 2) {
        if (typeof bin_oper[shiftingstr] == "function" && !inQuote) {
          let ind = i - 2;
          let arr = [exp.slice(0, ind), exp.slice(ind + 2)];
          arr = arr.map(a => a.replace(/^ */, '').replace(/ *$/, ''))
          inp = inp.replace(match, bin_oper[shiftingstr](...arr).toString())
          removeTemps()
          break;
        } else if (typeof bin_oper[shiftingstr[0]] == "function" && !inQuote) {
          if (exp[i - 3] == '[' && exp[i - 2] == '-') {
            i++
            continue;
          }
          let ind = i - 2;
          let arr = [exp.slice(0, ind), exp.slice(ind + 1)];
          arr = arr.map(a => a.replace(/^ */, '').replace(/ *$/, ''))
          inp = inp.replace(match, bin_oper[shiftingstr[0]](...arr).toString())
          removeTemps()
          break;
        }
      }
      if (shiftingstr.length == 2) {
        shiftingstr = shiftingstr.slice(1)
      }
      shiftingstr += exp[i];

      if (shiftQuote) {
        inQuote = !inQuote;
        shiftQuote = false;
      }
      if (exp[i] == '"' && exp[i - 1] != "\\") {
        shiftQuote = true;
      }
    }

  }
  let inQuote = false;
  let shiftQuote = false;
  let shiftingstr = ""
  let exp = inp;
  for (let i = 0; i < exp.length; i++) {
    if (unary_oper[exp.slice(0, i + 1)] && !unary_oper[exp.slice(0, i + 2)]) {
      inp = unary_oper[exp.slice(0, i + 1)](exp.slice(i + 1)).toString()
      removeTemps()
      return inp;
    } else if (functions[exp.slice(0, i + 1)] && exp[i + 1] == '{') {
      inp = functions[exp.slice(0, i + 1)].run(exp.slice(i + 1)).toString()
    }
  }
  for (let i = 0; i < exp.length + 1; i++) {
    if (i > 2) {
      if (typeof bin_oper[shiftingstr] == "function" && !inQuote) {
        let ind = i - 2;
        let arr = [exp.slice(0, ind), exp.slice(ind + 2)];
        arr = arr.map(a => a.replace(/^ */, '').replace(/ *$/, ''))
        inp = bin_oper[shiftingstr](...arr).toString();
        removeTemps()
        return inp;
      } else if (typeof bin_oper[shiftingstr[0]] == "function" && !inQuote) {
        if (!(exp[i - 3] == '[' && exp[i - 2] == '-')) {
          let ind = i - 2
          let arr = [exp.slice(0, ind), exp.slice(ind + 1)];
          arr = arr.map(a => a.replace(/^ */, '').replace(/ *$/, ''))

          inp = bin_oper[shiftingstr[0]](...arr).toString()
          removeTemps()
          return inp;
        }
      }
    }
    if (shiftingstr.length == 2) {
      shiftingstr = shiftingstr.slice(1)
    }
    shiftingstr += exp[i];
    if (shiftQuote) {
      inQuote = !inQuote;
      shiftQuote = false;
    }
    if (exp[i] == '"' && exp[i - 1] != "\\") {
      shiftQuote = true;
    }
  }
  return inp
}
let i = 0, file = fs.readFileSync(filename, 'utf8');
let line = ''
if (file.split('\n')[0].match(/import \{( *[a-zA-Z]+[0-9]* *,?)* *\}/)) {
  let match = file.split('\n')[0].match(/import \{( *[a-zA-Z]+[0-9]* *,?)* *\}/g)[0]
  let params = match.match(/\{.*\}/g)[0].slice(1, -1)
  let libs = params.replaceAll(' ', '').split(',')
  for (let i of libs) {
    let libfile = fs.readFileSync(i + '.pepl')
    file = `${extensionAdd}${i}\n${libfile}\n${extensionRemove}${i}\n${file}`
  }
  file = file.replace(match, '')
}
file = file.replaceAll(/^ */gm, '')
let funcmatch = /^(while|if|((int|string|bool|float|void)(\[\])* ([a-zA-Z]+[0-9]*))) *\(.*\)\{(([^{}]|([a-zA-Z]+[0-9]*\{.*\}))*)\}/gm
while (file.match(funcmatch)) {
  let match = file.match(funcmatch)[0];
  let name = match.match(/(while|if|((int|string|bool|float|void)(\[\])* ([a-zA-Z]+[0-9]*)))/g)[0]
  let params = match.match(/\(.*\)(?= *{)/g)[0].slice(1, -1)
  let cmds = match.match(/\{(.|\n)*\}/g)[0].slice(1, -1)
  let hash = crypto.createHash("sha256").update(match).digest("hex")
  commands[hash] = {
    "name": name,
    "params": params,
    "cmds": cmds
  }
  file = file.replace(match, hash)
}
file = file.replaceAll('\n\n', '\n').replaceAll(/>:.*/g, '').split('\n').filter(a => a)
for (let i in bin_oper_mut) {
  bin_oper[i] = bin_oper_mut[i]
  eval(`bin_oper["${i}="] = function(a,b){
        let name = a
        a = checkType(a);
        if(a.base == "ref"){
            let check = bin_oper["${i}"](a.value.toString(),b)
            if(check.type == a.type){
                a.value = check
                return a.value
            }else{
                throw new TypeError("Cannot assign " + check.type + " to " + a.type)
            }
        }
        throw new TypeError(name + " is not a reference")
    }`)
  eval(`bin_oper["${i}@"] = function(a,b){
        a = checkType(a,checkType(b).type)
        b = checkType(b,a.type);
        if(a.base == "ref"){
            a = a.value
        }
        if(b.base == "ref"){
            b = b.value
        }
        if(a.base != 'arr' || b.base != 'arr'){
            throw new TypeError("Cannot use operator ${i} on " + a.type + ' and ' + b.type)
        }
        if(a.val.length == b.val.length){
            let holdarr = new arr(a.type,'[]')
            for(let i = 0;i < a.val.length;i++){
                let val = bin_oper["${i}"](a.val[i].toString(),b.val[i].toString())
                holdarr.val.push(val)
            }
            return holdarr;
        }
        throw new TypeError("Arrays are not the same length")
    }`)
}
try {
  while (i < file.length) {
    compile(file[i]);
    i++;
  }
} catch (e) {
  if (commands[line]) {
    console.error(`${block[line].name}(${block[line].params})`)
  } else {
    console.error(line, '\n')
  }
  console.error(`${e}, on line ${i + 1}.\n`)
}