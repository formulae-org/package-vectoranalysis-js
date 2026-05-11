# package-vectoranalysis-js

Vector analysis package for the [Fōrmulæ](https://formulae.org) programming language.

Fōrmulæ is also a software framework for visualization, edition and manipulation of complex expressions, from many fields. The code for a specific field —i.e. vector analysis— is encapsulated in a single unit called a Fōrmulæ **package**.

This repository contains the source code for the **vector analysis package**. It provides visualization of vector differential operators, norms, inner products, and Dirac notation.

The GitHub organization [formulae-org](https://github.com/formulae-org) encompasses the source code for the rest of packages, as well as the [web application](https://github.com/formulae-org/formulae-js).

### Capabilities ###

* Differential operators (visualization only; reduction deferred)
    * [Gradient](https://en.wikipedia.org/wiki/Gradient) ∇f
    * [Divergence](https://en.wikipedia.org/wiki/Divergence) ∇·F
    * [Curl](https://en.wikipedia.org/wiki/Curl_(mathematics)) ∇×F
    * [Laplacian](https://en.wikipedia.org/wiki/Laplace_operator) ∇²f or Δf (configurable style)
* Norm and inner product (visualization only; reduction deferred)
    * [Norm](https://en.wikipedia.org/wiki/Norm_(mathematics)) ‖v‖ or ‖v‖_p
    * [Inner product](https://en.wikipedia.org/wiki/Inner_product_space) ⟨u, v⟩
* [Dirac notation](https://en.wikipedia.org/wiki/Bra%E2%80%93ket_notation) (visualization only; reduction deferred)
    * Bra ⟨ψ|, Ket |φ⟩, Braket ⟨ψ|φ⟩
