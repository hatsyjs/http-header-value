HTTP Header Value
=================

[![NPM][npm-image]][npm-url]
[![CircleCI][ci-image]][ci-url]
[![codecov][codecov-image]][codecov-url]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

Parse HTTP header value:
```typescript
import { hthvParse} from 'http-header-value';

const [contentType] = hthvParse('text/html;charset=utf8'); // text/html
contentType.v;          // text/html
contentType.charset.v;  // utf8

const [product, sysInfo, platform, version] = 
    hthvParse('Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0');

product.v;        // Mozilla/5.0
sysInfo.v;        // X11
sysInfo.pl[0].v;  // Linux x86_64
sysInfo.p.rv.v;   // 70.0
platform.v;       // Gecko/20100101
version.v;        // Firefox/70.0
```

[npm-image]: https://img.shields.io/npm/v/http-header-value.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/http-header-value
[ci-image]: https://img.shields.io/circleci/build/github/surol/http-header-value?logo=circleci
[ci-url]: https://circleci.com/gh/surol/http-header-value
[codecov-image]: https://codecov.io/gh/surol/http-header-value/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/surol/http-header-value
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/surol/http-header-value
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://surol.github.io/http-header-value/


hthvParse()
-----------

This is a parser function for HTP header value, that splits it onto items of type `HthvItem`.

The value of item is stored in its `v` property. While its `$` property contains a type of item, and may be one of:
- `quoted-string`,
- `tagged-string`,
- `date-time`,
- `raw` (the default).


### Multiple Items

Header value may consist of multiple comma- or space- separated items:
> `Allow`: __`GET, POST, HEAD`__ \
> `Authorization`: __`Basic YWxhZGRpbjpvcGVuc2VzYW1l`__

That's why the parser returns an array of items.

```typescript
import { hthvParse} from 'http-header-value';

hthvParse('GET, POST, HEAD').map(item => item.v); // ['GET', 'POST', 'HEAD']
hthvParse('Basic YWxhZGRpbjpvcGVuc2VzYW1l').map(item => item.v); // ['Basic', 'YWxhZGRpbjpvcGVuc2VzYW1l'];
```

### Comments

Header value may contain comments enclosed in parentheses.
> `User-Agent:` __`Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0`__

The parser recognizes top-level comments
```typescript
import { hthvParse} from 'http-header-value';

hthvParse('Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0')
    .map(item => item.v); // ['Mozilla/5.0', 'X11', 'Gecko/20100101', 'Firefox/70.0'];
```


### Item Parameters

Each item may have a semicolon-separated parameters. Each parameter may have a name. The name of the value should be
a valid token, while its value is separated from name by `=` sign, or by `:` sign within comments.
> `Accept`: __`text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8`__ \
> `User-Agent:` __`Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0`__

Parameters are available via the `p` property of `HthvItem`, that contains a parameter map. And via `pl` property
that contains an array of all parameters.

Each parameter is represented as `HthvItem` too. Parameter name is available from its `n` property.
```typescript
import { hthvParse} from 'http-header-value';

hthvParse('text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8')
    .map(({ v, p: { q } }) => ({ contentType: v, weight: q ? parseFloat(q.v) : 1.0 }));
//  [
//    { contentType: 'text/html', weight: 1 },
//    { contentType: 'application/xhtml+xml', weight: 1 },
//    { contentType: 'application/xml', weight: 0.9 },
//    { contentType: 'image/webp', weight: 1 },
//    { contentType: '*/*', weight: 0.8 }
//  ]

const [, comment] = hthvParse(`Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0`);
comment.pl.map(({ n, v }) => n ? `${n}=${v}` : v); // [ 'Linux x86_64', 'rv=70.0' ]
```

Item itself may be a name/value pair.
> `Cookie`: __`PHPSESSID=298zf09hf012fh2`__

The parser correctly recognizes this.
```typescript
import { hthvParse} from 'http-header-value';

hthvParse('PHPSESSID=298zf09hf012fh2'); // { n: 'PHPSESSID', v: '298zf09hf012fh2' }
```


### Quoted String

Values can be enclosed into double quotes. This works both for item values and for parameters.

> `Clear-Site-Data:` __`"cache"`__ \
> `Public-Key-Pins:` __`pin-sha256="M8HztCzM3elUxkcjR2S5P4hhyBNf6lHkmjAHKhpGPWE="; max-age=5184000; includeSubDomains; report-uri="https://www.example.org/hpkp-report"`__

The returned item would contain the value unquoted and unescaped, and the type of item would be `quoted-string`.

```typescript
import { hthvParse} from 'http-header-value';

hthvParse('"cache"')[0]; // { $: 'quoted-string', v: 'cache' }

const [pin] = hthvParse(
    'pin-sha256="M8HztCzM3elUxkcjR2S5P4hhyBNf6lHkmjAHKhpGPWE="; '
    + 'max-age=5184000; '
    + 'includeSubDomains; '
    + 'report-uri="https://www.example.org/hpkp-report"'
);
pin.v;              // { $: 'quoted-string', n: 'pin-sha256', v: 'M8HztCzM3elUxkcjR2S5P4hhyBNf6lHkmjAHKhpGPWE=' }
pin.p['report-url'] // { $: 'quoted-string', n: 'report-uri', v: 'https://www.example.org/hpkp-report' } 
```


### Tagged String

Some headers, such as `ETag` have special syntax that allows to prepend a quoted string with a tag:
> `ETag:` __`W/"0815"`__

The parser recognizes such item value (but not parameter ones!) as `HthvItem` with type `tagged-string`, and places
the tag to its `t` property and unquoted string - to its `v` property..
```typescript
import { hthvParse} from 'http-header-value';

hthvParse('W/"0815"')[0]; // { $: 'tagged-string', t: 'W/', v: '0815' }
```


### Date/Time

Date and time has special format in headers.
> `Date:` __`Wed, 21 Oct 2015 07:28:00 GMT`__
> `Set-Cookie:` __`id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT`__

The parser represents such values as `HthvItem` of `date-time` type.
```typescript
import { hthvParse} from 'http-header-value';

hthvParse('Wed, 21 Oct 2015 07:28:00 GMT')[0].v; // { $: 'date-time', v: 'Wed, 21 Oct 2015 07:28:00 GMT' }

hthvParse('id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT')[0].p.Expires;
// { $: 'date-time', n: 'Expires', v: 'Wed, 21 Oct 2015 07:28:00 GMT' }
``` 


Utilities
---------

### hthvEscapeQ()

Escapes a string to be included into [quoted-string] within HTTP header value.

Replaces `\` with `\\`, and `"` with `\"`.

```typescript
import { hthvExcapeQ } from 'http-header-value';

const realm = 'Access to the "Site"';
const wwwAuthenticate = `WWW-Authenticate: Basic realm="${hthvExcapeQ(realm)}"`;
// WWW-Authenticate: Basic realm="Access to the \"Site\""
```

[quoted-string]: (https://tools.ietf.org/html/rfc7230#section-3.2.6)


### hthvEscapeC()

Escapes a string to be included into [comment] withing HTTP header value.

Replaces `\` with `\\`, `"` with `\"`, `(` with `\(`, and `)` with `\)`.

According to [RFC7230] the sender should not escape a double quote in this case. However, it may be necessary
to distinguish between raw double quote and nested [quoted-string].

```typescript
import { hthvExcapeC } from 'http-header-value';

const comment = 'Custom ("quoted") comment'
const customComment = `Custom-Comment: (${hthvExcapeC(comment)})`;
// CustomComment: (Custom \(\"quoted\"\) comment)
```

[comment]: https://tools.ietf.org/html/rfc7230#section-3.2.6
[RFC7230]: https://tools.ietf.org/html/rfc7230


### hthvQuote()

Conditionally encloses HTTP header value or its part into double quotes.

Quotes will be added if delimiter or special character is present in input `string`, or the input `string` is empty.
Escapes `"` and `\` symbols.

```typescript
import { hthvQuote } from 'http-header-value';

function forwardedHeader(forIp: string) {
    return `Forwarded: For=${hthvQuote(forIp)}`
}

forwardedHeader('127.0.0.1');                // Forwarded: For=127.0.0.1
forwardedHeader('[2001:db8:cafe::17]:4711'); // Forwarded: For="[2001:db8:cafe::17]:4711"
```
