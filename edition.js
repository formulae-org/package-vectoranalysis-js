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
	Formulae.addEdition(
		this.messages.pathDifferential, null, this.messages.leafGradient,
		() => Expression.wrapperEdition("VectorAnalysis.Differential.Gradient")
	);
	Formulae.addEdition(
		this.messages.pathDifferential, null, this.messages.leafDivergence,
		() => Expression.wrapperEdition("VectorAnalysis.Differential.Divergence")
	);
	Formulae.addEdition(
		this.messages.pathDifferential, null, this.messages.leafCurl,
		() => Expression.wrapperEdition("VectorAnalysis.Differential.Curl")
	);
	Formulae.addEdition(
		this.messages.pathDifferential, null, this.messages.leafLaplacian,
		() => Expression.wrapperEdition("VectorAnalysis.Differential.Laplacian")
	);
	Formulae.addEdition(
		this.messages.pathVectorAnalysis, null, this.messages.leafNorm,
		() => Expression.wrapperEdition("VectorAnalysis.Norm")
	);
	Formulae.addEdition(
		this.messages.pathVectorAnalysis, null, this.messages.leafNormWithOrder,
		() => Expression.multipleEdition("VectorAnalysis.Norm", 2, 0)
	);
	Formulae.addEdition(
		this.messages.pathVectorAnalysis, null, this.messages.leafInnerProduct,
		() => Expression.multipleEdition("VectorAnalysis.InnerProduct", 2, 0)
	);
	Formulae.addEdition(
		this.messages.pathDirac, null, this.messages.leafBra,
		() => Expression.wrapperEdition("VectorAnalysis.Dirac.Bra")
	);
	Formulae.addEdition(
		this.messages.pathDirac, null, this.messages.leafKet,
		() => Expression.wrapperEdition("VectorAnalysis.Dirac.Ket")
	);
	Formulae.addEdition(
		this.messages.pathDirac, null, this.messages.leafBraket,
		() => Expression.multipleEdition("VectorAnalysis.Dirac.Braket", 2, 0)
	);
};

VectorAnalysisPackage.setActions = function() {};
