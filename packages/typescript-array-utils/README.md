# typescript-array-utils
> Immutable array manipulation methods

[![NPM](https://nodei.co/npm/typescript-array-utils.png?compact=true)](https://nodei.co/npm/typescript-array-utils/)
[![Build Status](https://travis-ci.org/mleko/typescript-array-utils.svg?branch=master)](https://travis-ci.org/mleko/typescript-array-utils)

### Installation

Library can be installed via [npm](https://www.npmjs.com/package/typescript-array-utils).

```
$ npm install typescript-array-utils
```

### Examples

#### insert
```typescript
import {insert} from "typescript-array-utils";
insert([0, 1, 2, 3, 4], 2, 5);
 //=> [ 0, 1, 5, 2, 3, 4 ]
```

#### move
```typescript
import {move} from "typescript-array-utils";
move([0, 1, 2, 3, 4, 5], 1, 4);
 //=> [ 0, 2, 3, 4, 1, 5 ]
```

#### replace
```typescript
import {replace} from "typescript-array-utils";
const input = [{a: 0}, {a: 1}, {a: 2}];
const element = {a: 3};
replace(input, 1, element)
 //=> [ { a: 0 }, { a: 3 }, { a: 2 } ]
```

#### unique
```typescript
import {unique} from "typescript-array-utils";
unique([3, 1, 2, 1, 3, 4, 1])
 //=> [ 3, 1, 2, 4 ]

unique([{id: 1}, {id: 2}, {id: 1}, {id: 6}], (o1, o2) => o1.id === o2.id)
 //=> [ { id: 1 }, { id: 2 }, { id: 6 } ]
```

#### without
```typescript
import {without} from "typescript-array-utils";
without([0, 1, 2, 3, 4], 2)
 //=> [ 0, 1, 3, 4 ]
```

### [License (MIT)](LICENSE.md)
