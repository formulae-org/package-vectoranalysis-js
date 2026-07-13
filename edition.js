/*
Fōrmulæ vector analysis package. Module for edition.
Copyright (C) 2015-2026 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

export class VectorAnalysisPackage extends Formulae.EditionPackage {};

VectorAnalysisPackage.setEditions = function() {
	// Differential operators — wrappers: ∇▮ / ∇·▮ / ∇×▮ / ∇²▮ (Laplacian is style-dependent)
	Formulae.addEdition(this.messages.pathDifferential, Formulae.icon("VectorAnalysis.Differential.Gradient",   1), this.messages.leafGradient,   () => Expression.wrapperEdition("VectorAnalysis.Differential.Gradient"));
	Formulae.addEdition(this.messages.pathDifferential, Formulae.icon("VectorAnalysis.Differential.Divergence", 1), this.messages.leafDivergence, () => Expression.wrapperEdition("VectorAnalysis.Differential.Divergence"));
	Formulae.addEdition(this.messages.pathDifferential, Formulae.icon("VectorAnalysis.Differential.Curl",       1), this.messages.leafCurl,       () => Expression.wrapperEdition("VectorAnalysis.Differential.Curl"));
	Formulae.addEdition(this.messages.pathDifferential, Formulae.icon("VectorAnalysis.Differential.Laplacian",  1), this.messages.leafLaplacian,  () => Expression.wrapperEdition("VectorAnalysis.Differential.Laplacian"));

	// Norm / inner product
	Formulae.addEdition(this.messages.pathVectorAnalysis, Formulae.icon("VectorAnalysis.Norm",         1), this.messages.leafNorm,          () => Expression.wrapperEdition("VectorAnalysis.Norm"));
	Formulae.addEdition(this.messages.pathVectorAnalysis, Formulae.icon("VectorAnalysis.Norm",         2), this.messages.leafNormWithOrder, () => Expression.multipleEdition("VectorAnalysis.Norm", 2, 0));
	Formulae.addEdition(this.messages.pathVectorAnalysis, Formulae.icon("VectorAnalysis.InnerProduct", 2), this.messages.leafInnerProduct,  () => Expression.multipleEdition("VectorAnalysis.InnerProduct", 2, 0));

	// Dirac notation — ⟨▮| / |▮⟩ / ⟨▮|▯⟩
	Formulae.addEdition(this.messages.pathDirac, Formulae.icon("VectorAnalysis.Dirac.Bra",    1), this.messages.leafBra,    () => Expression.wrapperEdition("VectorAnalysis.Dirac.Bra"));
	Formulae.addEdition(this.messages.pathDirac, Formulae.icon("VectorAnalysis.Dirac.Ket",    1), this.messages.leafKet,    () => Expression.wrapperEdition("VectorAnalysis.Dirac.Ket"));
	Formulae.addEdition(this.messages.pathDirac, Formulae.icon("VectorAnalysis.Dirac.Braket", 2), this.messages.leafBraket, () => Expression.multipleEdition("VectorAnalysis.Dirac.Braket", 2, 0));
};

VectorAnalysisPackage.setActions = function() {};
