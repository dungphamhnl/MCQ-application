# XPath — theoretical answers (no code execution)

Sample XML (nested `library`, several `book` elements with `type` attributes).

## 1) Return all `book` elements

```xpath
//book
```

(or `/library//book` — same set for this document.)

## 2) Return all `title` elements whose parent is a `book` with `type` equal to `novel`

```xpath
//book[@type='novel']/title
```

**Note on the given data:** the sample fragment uses `type` values such as `doc`, `roman`, and `bd`. There is **no** `type="novel"`, so this expression returns an **empty** node set on that XML. If the exam text meant `roman` (e.g. typo or line break), use:

```xpath
//book[@type='roman']/title
```

which would select the `title` nodes for `toto3` and `toto5`.

## 3) Return the number of `book` elements with `type` equal to `comic`

```xpath
count(//book[@type='comic'])
```

On the provided sample there is **no** `comic` type, so the **count is 0**.

## 4) What does `/library/library/ancestor-or-self::library` return?

The path `/library/library` selects the **inner** `library` element (the child of the outer `library`). Evaluating `ancestor-or-self::library` from that inner node yields:

- the **inner** `library` (self), and  
- its **ancestor** `library` (the outer root element).

So the result is a **sequence of two** `library` nodes (typically in **document order**: outer first, then inner, depending on the XPath processor’s ordering rules for the combined axis; both nodes are included).

**Query as written (absolute path, no dot):** In XPath 1.0 this is often read as a path that ends at the inner `library` with a **predicate** or **step** — the usual exam form is:

```xpath
/library/library/ancestor-or-self::library
```

which selects those two `library` elements as described above.
