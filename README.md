HTTP Header Value
=================

[![NPM][npm-image]][npm-url]
[![CircleCI][ci-image]][ci-url]
[![codecov][codecov-image]][codecov-url]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

Parse HTTP header value:
```typescript
import { hthvParse, hthvParseCommented } from '@proc7ts/http-header-value';

const [contentType] = hthvParse('text/html;charset=utf-8');
contentType.v;           // text/html
contentType.p.charset.v; // utf-8

const [product, sysInfo, platform, version] = 
    hthvParseCommented('Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0');

product.v;        // Mozilla/5.0
sysInfo.v;        // X11
sysInfo.pl[0].v;  // Linux x86_64
sysInfo.p.rv.v;   // 70.0
platform.v;       // Gecko/20100101
version.v;        // Firefox/70.0
```

[npm-image]: https://img.shields.io/npm/v/@proc7ts/http-header-value.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@proc7ts/http-header-value
[ci-image]: https://img.shields.io/circleci/build/github/proc7ts/http-header-value?logo=circleci
[ci-url]: https://circleci.com/gh/proc7ts/http-header-value
[codecov-image]: https://codecov.io/gh/proc7ts/http-header-value/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/proc7ts/http-header-value
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/proc7ts/http-header-value
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://proc7ts.github.io/http-header-value/

Supported Headers
-----------------

[See the list of supported HTTP headers and parsers best suited for them](https://github.com/surol/http-header-value/wiki/Supported-Headers)


HthvParser
----------

`HthvParser` is a signature of parser function for HTP header value.

The `httvParse()` function is parser with default configuration.

The `newHthvParser()` function may be used to configure custom parser. There are also numerous custom parser suitable
to parse specific headers ([see below][Custom Parsers]).

The parser splits the header value string onto items of type `HthvItem`.

The value of item is stored in its `v` property. While its `$` property contains a type of item, and may be one of:
- `quoted-string`,
- `tagged-string`,
- `angle-bracketed-string`,
- `date-time`,
- `raw` (the default).


### Multiple Items

Header value may consist of multiple comma- or space- separated items:
> `Allow`: __`GET, POST, HEAD`__ \
> `Authorization`: __`Basic YWxhZGRpbjpvcGVuc2VzYW1l`__

That's why the parser returns an array of items.

```typescript
import { hthvParse} from '@proc7ts/http-header-value';

hthvParse('GET, POST, HEAD').map(item => item.v); // ['GET', 'POST', 'HEAD']
hthvParse('Basic YWxhZGRpbjpvcGVuc2VzYW1l').map(item => item.v); // ['Basic', 'YWxhZGRpbjpvcGVuc2VzYW1l'];
```

### Item Parameters

Each item may have a semicolon-separated parameters. Each parameter may have a name. Parameter name should be a valid
token, while its value is separated from the name by `=` sign, or by `:` sign within comments.
> `Accept`: __`text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8`__ \
> `User-Agent:` __`Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0`__

Parameters are available via the `p` property of `HthvItem` that contains a parameter map. And via `pl` property
that contains an array of all parameters.

Each parameter is represented as `HthvItem` too. Parameter name is available from its `n` property.
```typescript
import { hthvParse, hthvParseCommented } from '@proc7ts/http-header-value';

hthvParse('text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8')
    .map(({ v, p: { q } }) => ({ contentType: v, weight: q ? parseFloat(q.v) : 1.0 }));
//  [
//    { contentType: 'text/html', weight: 1 },
//    { contentType: 'application/xhtml+xml', weight: 1 },
//    { contentType: 'application/xml', weight: 0.9 },
//    { contentType: 'image/webp', weight: 1 },
//    { contentType: '*/*', weight: 0.8 }
//  ]

const [, comment] = hthvParseCommented(`Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0`);
comment.pl.map(({ n, v }) => n ? `${n}=${v}` : v); // [ 'Linux x86_64', 'rv=70.0' ]
```

Item itself can be a name/value pair.
> `Cookie`: __`PHPSESSID=298zf09hf012fh2`__

The parser correctly recognizes this.
```typescript
import { hthvParse } from '@proc7ts/http-header-value';

hthvParse('PHPSESSID=298zf09hf012fh2'); // { n: 'PHPSESSID', v: '298zf09hf012fh2' }
```


### Quoted String

Values can be enclosed into double quotes. This works both for item values and for parameters.

> `Clear-Site-Data:` __`"cache"`__ \
> `Public-Key-Pins:` __`pin-sha256="M8HztCzM3elUxkcjR2S5P4hhyBNf6lHkmjAHKhpGPWE="; max-age=5184000; includeSubDomains; report-uri="https://www.example.org/hpkp-report"`__

The returned item contains the value unquoted and unescaped. The type of such item is `quoted-string`.

```typescript
import { hthvParse } from '@proc7ts/http-header-value';

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

Some headers have special syntax that allows to prepend a quoted string with a tag:
> `ETag:` __`W/"0815"`__

The parser recognizes such item value (but not parameter ones!) as `HthvItem` with type `tagged-string`, and places
the tag into its `t` property, and unquoted string - into its `v` property.
```typescript
import { hthvParse } from '@proc7ts/http-header-value';

hthvParse('W/"0815"')[0]; // { $: 'tagged-string', t: 'W/', v: '0815' }
```


### Angle brackets

Some headers use angle brackets to enclose strings with special symbols. E.g. URLs:
> `Link:` __`<https://example.com/index.html?mode=preconnect>; rel="preconnect"`__

The parser recognizes such item or parameter value as `HthvItem` with type `angle-bracketed-string` and value without
brackets. Escape sequences are not supported inside angle brackets.
```typescript
import { hthvParse } from '@proc7ts/http-header-value';
hthvParse('<https://example.com/index.html?mode=preconnect>; rel="preconnect"');
// [{ 
//   $: 'angle-bracketed-string',
//   v: 'https://example.com/index.html?mode=preconnect',
//   p: {
//     rel: { $: 'raw', n: 'rel', v: 'preconnect' }
//   },
//   pl: [{ $: 'raw', n: 'rel', v: 'preconnect' }]
// }]                                        
//
```



### Date/Time

Date and time value has special format in headers.
> `Date:` __`Wed, 21 Oct 2015 07:28:00 GMT`__ \
> `Set-Cookie:` __`id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT`__

The parser represents such value as `HthvItem` of `date-time` type.
```typescript
import { hthvParse } from '@proc7ts/http-header-value';

hthvParse('Wed, 21 Oct 2015 07:28:00 GMT')[0].v; // { $: 'date-time', v: 'Wed, 21 Oct 2015 07:28:00 GMT' }

hthvParse('id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT')[0].p.Expires;
// { $: 'date-time', n: 'Expires', v: 'Wed, 21 Oct 2015 07:28:00 GMT' }
``` 


Custom Parsers
--------------

[Custom Parsers]: #custom-parsers

There is no standard for HTTP header value syntax. And there is no way to implement a parser suitable for all headers.

The parser can be configured to understand different header formats. A `newHthvParser()` function can be used for that.
But configuring it properly isn't a simple task. So, the `http-header-value` package contains some preconfigured
parsers in addition to default one.


### Comments

Some headers may contain comments enclosed in parentheses.
> `User-Agent:` __`Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0`__

Comments parsing is disabled by default. But can be enabled in custom parser. Such parser recognizes top-level comments.
But typically it is enough to use an `hthvParseCommented()` parser.
```typescript
import { hthvParseCommented } from '@proc7ts/http-header-value';

hthvParseCommented('Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0')
    .map(item => item.v); // ['Mozilla/5.0', 'X11', 'Gecko/20100101', 'Firefox/70.0'];
``` 

### URIs

URLs may contain `,`, `;`, '(', ')', and `=` symbols, that treated specially by default.
> `Location:` __`http://example.com/matrix;param=(value)?q=some`__

The `httpParseURIs()` parser may be used to parse such header values.
```typescript
import { hthvParseURIs } from '@proc7ts/http-header-value';

hthvParseURIs('http://example.com/matrix;param=(value)?q=some');
// { $: 'raw', v: 'http://example.com/matrix;param=(value)?q=some' };
``` 


### Cookies

Cookies can be set in response by `Set-Cookie` header, and in request by `Cookie` one:
> `Set-Cookie:` __`id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT, SESSIONID=fdkafretercvx`__ \
> `Cookie:` __`id=a3fWa; SESSIONID=fdkafretercvx`__

The `Set-Cookie` value can be parsed by default `hthvParse()` parser. While the `Cookie` value contains cookies
semicolon-separated. The `hthvParseSemiSep()` parser handles this.
```typescript
import { hthvParseSemiSep } from '@proc7ts/http-header-value';

hthvParseSemiSep('id=a3fWa; SESSIONID=fdkafretercvx')
    .reduce((map, { n, v }) => ({ ...map, [n]: v }), {});
// {
//   id: '3fWa',
//   SESSIONID: 'fdkafretercvx'
// }
```


### Directives

Some headers contain directives. Directives are parameterized items using spaces instead of semicolons to delimit
parameters. While semicolons and colons are used to delimit items.
> `Content-Security-Policy:` __`default-src 'self' http://example.com; connect-src 'none'`__ \
> `Via`: __`HTTP/1.1 GWA, 1.0 fred, 1.1 p.example.net`__

The `hthvParseDirectives()` parser supports this format.
```typescript
import { hthvFlatten, hthvParseDirectives } from '@proc7ts/http-header-value';

const { map: { defaultSrc, connectSrc } } =
    hthvFlatten(hthvParseDirectives(`default-src 'self' http://example.com; connect-src 'none'`));

defaultSrc.p[0].v; // 'self'
defaultSrc.p[1].v; // http://example.com
connectSrc.p[0].v; // 'none'
```


Utilities
---------

### hthvFlatten()

Flattens HTTP header value items by extracting their parameters.

The result is an items collection containing original `items`, as well as their parameters.

Recursively places `items` and their parameters to result map in their original order, and:
- prefers named items over unnamed ones,
- prefers original items over their parameters,
- prefers items added first.

```typescript
import { hthvFlatten, hthvParseSemiSep } from '@proc7ts/http-header-value';

hthvFlatten(hthvParseSemiSep('id=a3fWa; SESSIONID=fdkafretercvx'));
// {
//   list: [
//     { $: 'raw', n: 'id', v: 'a3fWa' },
//     { $: 'raw', n: 'SESSIONID', v: 'fdkafretercvx' },
//   ],
//   map: {
//     id: { $: 'raw', n: 'id', v: 'a3fWa' },
//     SESSIONID: { $: 'raw', n: 'SESSIONID', v: 'fdkafretercvx' },     
//   },  
// }

```


### hthvEscapeQ()

Escapes a string to be included into [quoted-string] within HTTP header value.

Replaces `\` with `\\`, and `"` with `\"`.

```typescript
import { hthvExcapeQ } from '@proc7ts/http-header-value';

const realm = 'Access to the "Site"';
const wwwAuthenticate = `WWW-Authenticate: Basic realm="${hthvExcapeQ(realm)}"`;
// WWW-Authenticate: Basic realm="Access to the \"Site\""
```

[quoted-string]: https://tools.ietf.org/html/rfc7230#section-3.2.6


### hthvEscapeC()

Escapes a string to be included into [comment] withing HTTP header value.

Replaces `\` with `\\`, `"` with `\"`, `(` with `\(`, and `)` with `\)`.

According to [RFC7230] the sender should not escape a double quote in this case. However, it may be necessary
to distinguish between raw double quote and nested [quoted-string].

```typescript
import { hthvExcapeC } from '@proc7ts/http-header-value';

const comment = 'Custom ("quoted") comment'
const customComment = `Custom-Comment: (${hthvExcapeC(comment)})`;
// Custom-Comment: (Custom \(\"quoted\"\) comment)
```

[comment]: https://tools.ietf.org/html/rfc7230#section-3.2.6
[RFC7230]: https://tools.ietf.org/html/rfc7230


### hthvQuote()

Conditionally encloses HTTP header value or its part into double quotes.

Quotes will be added if delimiter or special character is present in input `string`, or the input `string` is empty.
Escapes `"` and `\` symbols.

```typescript
import { hthvQuote } from '@proc7ts/http-header-value';

function forwardedHeader(forIp: string) {
    return `Forwarded: For=${hthvQuote(forIp)}`
}

forwardedHeader('127.0.0.1');                // Forwarded: For=127.0.0.1
forwardedHeader('[2001:db8:cafe::17]:4711'); // Forwarded: For="[2001:db8:cafe::17]:4711"
```
