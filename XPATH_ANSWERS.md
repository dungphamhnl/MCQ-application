# XPath — Theoretical Part

Sample XML:

```xml
<library>
  <book><title>toto1</title><author>titi</author></book>
  <book type="doc"><title>toto2</title><author>titi</author></book>
  <book type="roman"><title>toto3</title><author>titi</author></book>
  <book type="bd"><title>toto4</title><author>titi2</author></book>
  <library>
    <book type="roman"><title>toto5</title><author>titi</author></book>
  </library>
</library>
```

---

## Question 1
**Return all `book` elements**

```xpath
//book
```

> `//` selects all `book` elements anywhere in the document.
> Result: toto1, toto2, toto3, toto4, toto5 (all 5 books).

---

## Question 2
**Return all `title` elements whose parent is a `book` with `type` attribute equal to `novel`**

```xpath
//book[@type='novel']/title
```

> Step 1: `//book[@type='novel']` — find all `book` elements where `type="novel"`
> Step 2: `/title` — get their `title` child
>
> **Result on the given XML: empty node-set** (no book has `type="novel"` — existing types are `doc`, `roman`, `bd`)

---

## Question 3
**Return the number of `book` elements with `type` attribute equal to `comic`**

```xpath
count(//book[@type='comic'])
```

> `count()` returns the number of nodes matching the expression.
>
> **Result on the given XML: `0`** (no book has `type="comic"`)

---

## Question 4
**What does the following XPath query return: `/library/library/ancestor-or-self::library`**

```xpath
/library/library/ancestor-or-self::library
```

Step by step:
1. `/library/library` — selects the **inner** `<library>` (the one containing toto5)
2. `ancestor-or-self::library` — from that inner node, includes itself **and** all its ancestors that are `<library>`
   - `self` → inner `<library>`
   - `ancestor` → outer `<library>` (parent of inner)

> **Result: 2 `<library>` elements** — both the inner and outer library nodes.
