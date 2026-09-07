## Commenting

### No Inline Comments

Inline comments are banned. Name things well and let the code say what it does. A comment is
justified only when the code cannot be understood without it: a non-obvious constraint, a reason a
line must stay exactly as it is, or a required directive such as `@ts-expect-error`.

### Two Lines, and Say Why

When a comment is genuinely needed it runs to two lines at most and explains _why_, never _what_.
No section banners, no restating the signature, no commented-out code.

### JSDoc Is the Exception

A `/** ... */` block documenting an exported function, type or module is exempt from the two-line
limit and may include `@param`, `@returns` and an example. It documents the contract, the
assumptions and the surprises of a public surface, not the mechanics of the body underneath it.

### No Change Comments

A comment is a timeless explanation, not a changelog. Nothing about recent fixes, task numbers or
who changed what: that belongs in the commit message.
