## Why?

In software, a _reducer_ is a process that accepts an input and uses it to
update a state.

Reduction is often iterative. For example, the JavaScript
[reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
method works its way down an array, _reducing_ the array into whatever value or
object its reducer function specifies.

Reduction is often recursive, and it shows up anywhere you have a hierarchical
structure that needs to be summarized in some way.

The purpose of this project is to provide a very lightweight, general-purpose
component that can reduce the state of any hierarchy of React components.

## Reducing Forms

A form is an obvious candidate for reduction. It has a hierarchical structure: a
form may have nested sections that ultimately contain form input controls. Each
input control has a value state, but there are also other states that might be
tracked at every node of the hierarchy, including:

- _dirty_ (if a node value has changed since initial state)
- _touched_ (if a node has gained & lost focus)
- _valid_ (possibly based on other values across the state)
- _visited_ (if a node has ever gained focus)

Of course, every use case is a unique flower, and there is certainly room for
all kinds of reductions we didn't list above.

The genesis for this project was a complex form built with
[Semantic UI React](https://react.semantic-ui.com/) components. We needed lots
of validation and the Semantic form engine wasn't really up to the task. We
looked at external form reducer libraries&mdash;notably the very excellent
[React Final Form](https://final-form.org/react)&mdash;and were disappointed to
discover how they played with third-party components like the Semantic library.
You couldn't seem to get away from having to write an adapter around your
third-party components.

We wanted a reducer that could interact directly with _any_ component, no
adapters required. We also recognized that form reduction is just one instance
of the more general component reduction use case. We wanted to solve _that_ one.

So here we are.

## The Basics

TODO: Illustrate the structure of a basic reducer hierarchy.

## Collaborators

### `release-it` Configuration

This project includes [release-it](https://github.com/release-it/release-it)
support that requires these final configurations in your local repo:

1. Create a copy of `.env.development.local.template` and name it
   `.env.development.local`

1. Create a GitHub
   [personal access token](https://github.com/settings/tokens/new?scopes=repo&description=release-it)
   and add it as the value of `GITHUB_TOKEN` in `.env.development.local`.

You can now build build project and publish a release to GitHub and NPM with
these commands:

```
npm run build
npm run release
```
