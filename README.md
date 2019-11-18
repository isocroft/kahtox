# kahtox
A small JavaScript library based on state machines (but not entirely) for isolating and managing its own UI-state (transient / non-persisted) layer while controlling a Domain-state (non-transient / persisted) layer like Redux, MobX, Radixx.

## Inspiration

This work was inspired by earlier works by [David K. Piano](https://twitter.com/davidkpiano) on [**xstate**](https://github.com/davidkpiano/xstate) and [Krasimir Tsonev](http://krasimirtsonev.com/) on [**stent**](https://github.com/krasimir/stent). Drawing from their work and thinking deeply about the problem, it was now clear that there needed to be a paradigmn shift in the way we approached state management. *Xstate* for me is neat and helpful but is also too verbose and seeks to replace *Redux*. I have all these lingua and terminilogy like (Sequence, History, Orthogonal, Events, States, Effects, Guard) that i have to learn to make sense of it all. *Stent* on the other hand is less verbose but also seeks to replace *Redux* completely and adds composability problems (how do you compose one or more state machines together)

## Motivation

The need to separate today's monolith state management layer architecure into a more managable set of layers (2 of them actually)

1. UI State Layer (Transient / Non-Persisted)
2. Domain State Layer (Non-Transient / Persisted)

This need is long ovedue. state management libraries like Redux were under too much pressure to manage both UI State (which actually doesn't need to be persisted) and Domain state (which is actually meant to be put into a state container and persisted across web sessions)

However, this hasn't happened because everything is still built around verbosity and replacement. The idea is not to seek to replace Redux (even though [Redux could be better redesigned](https://hackernoon.com/redesigning-redux-b2baee8b8a38)) but to reduce the amount of "useless work" that libraries like MobX or Redux are doing - which is tracking UI State in the store state container.

## Concepts

>Reusability of State Graphs & Sub State Graphs
xxxxx

>Isolating State Containers From Most UI Updates
xxxxxxx

>
