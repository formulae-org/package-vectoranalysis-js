/*
Fōrmulæ vector analysis package. Module for expression definition & visualization.
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

export class VectorAnalysisPackage extends Formulae.ExpressionPackage {};

const LAPLACIAN_NABLA = 1;
const LAPLACIAN_DELTA = 2;

VectorAnalysisPackage.styleLaplacian = LAPLACIAN_NABLA;

const SUPER_SIZE       = -4;   // font-size delta for superscripts and subscripts
const PREFIX_GAP_FRAC  = 0.08; // gap between prefix symbol and operand, fraction of fontSize
const CONTENT_GAP_FRAC = 0.15; // gap between bracket and content, fraction of fontSize
const BAR_LINE_GAP     = 2;    // pixel gap between the two strokes of ‖
const LINE_THICK_FRAC  = 0.06; // bracket line width as fraction of fontSize
const ANGLE_WIDTH_FRAC = 0.28; // angle bracket horizontal span as fraction of bracket height

// ─── Angle bracket and pipe drawing helpers ───────────────────────────────────

function angleBracketWidth(height) {
	return Math.max(3, Math.round(height * ANGLE_WIDTH_FRAC));
}

// Draws ⟨ with its tip at (x, mid) and its back at x + w.
function drawOpeningAngle(context, x, y, height, lineWidth) {
	const w   = angleBracketWidth(height);
	const mid = y + Math.round(height / 2);
	context.save();
	context.lineWidth = lineWidth;
	context.beginPath();
	context.moveTo(x + w, y);
	context.lineTo(x,     mid);
	context.lineTo(x + w, y + height);
	context.stroke();
	context.restore();
}

// Draws ⟩ occupying [x, x+w]; tip at (x+w, mid), back at x.
function drawClosingAngle(context, x, y, height, lineWidth) {
	const w   = angleBracketWidth(height);
	const mid = y + Math.round(height / 2);
	context.save();
	context.lineWidth = lineWidth;
	context.beginPath();
	context.moveTo(x,     y);
	context.lineTo(x + w, mid);
	context.lineTo(x,     y + height);
	context.stroke();
	context.restore();
}

// Draws a vertical pipe | at x.
function drawPipe(context, x, y, height, lineWidth) {
	context.save();
	context.lineWidth = lineWidth;
	context.beginPath();
	context.moveTo(x, y);
	context.lineTo(x, y + height);
	context.stroke();
	context.restore();
}

// Draws ‖ (two vertical lines) with left edge at x.
function drawDoubleBar(context, x, y, height, lineWidth) {
	context.save();
	context.lineWidth = lineWidth;
	context.beginPath();
	context.moveTo(x,                         y);
	context.lineTo(x,                         y + height);
	context.moveTo(x + BAR_LINE_GAP + lineWidth, y);
	context.lineTo(x + BAR_LINE_GAP + lineWidth, y + height);
	context.stroke();
	context.restore();
}

// ─── NablaBase: shared layout for Gradient, Divergence, Curl ─────────────────

const NablaBase = class extends Expression {
	getPrefix()            { return "∇"; }
	canHaveChildren(count) { return count === 1; }
	
	prepareDisplay(context) {
		const fontSize = context.fontInfo.size;
		const gap      = Math.round(fontSize * PREFIX_GAP_FRAC);
		this.nbPrefixW = Math.ceil(context.measureText(this.getPrefix()).width);
		
		let ch0 = this.children[0];
		ch0.prepareDisplay(context);
		
		this.horzBaseline = Math.max(Math.round(fontSize / 2), ch0.horzBaseline);
		ch0.x             = this.nbPrefixW + gap;
		ch0.y             = this.horzBaseline - ch0.horzBaseline;
		
		this.width        = ch0.x + ch0.width;
		this.height       = this.horzBaseline + Math.max(Math.round(fontSize / 2), ch0.height - ch0.horzBaseline);
		this.vertBaseline = Math.round(this.width / 2);
	}
	
	display(context, x, y) {
		super.drawText(context, this.getPrefix(), x, y + this.horzBaseline + Math.round(context.fontInfo.size / 2));
		let ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
	}
	
	moveTo(direction)        { return this.children[0].moveTo(direction); }
	moveAcross(i, direction) { return this.moveOut(direction); }
};

// ─── Gradient ∇f ─────────────────────────────────────────────────────────────

const Gradient = class extends NablaBase {
	getTag()            { return "VectorAnalysis.Differential.Gradient"; }
	getName()           { return VectorAnalysisPackage.messages.nameGradient; }
	getChildName(index) { return VectorAnalysisPackage.messages.childGradientField; }
};

// ─── Divergence ∇·F ──────────────────────────────────────────────────────────

const Divergence = class extends NablaBase {
	getTag()            { return "VectorAnalysis.Differential.Divergence"; }
	getName()           { return VectorAnalysisPackage.messages.nameDivergence; }
	getChildName(index) { return VectorAnalysisPackage.messages.childDivergenceField; }
	getPrefix()         { return "∇·"; }
};

// ─── Curl ∇×F ────────────────────────────────────────────────────────────────

const Curl = class extends NablaBase {
	getTag()            { return "VectorAnalysis.Differential.Curl"; }
	getName()           { return VectorAnalysisPackage.messages.nameCurl; }
	getChildName(index) { return VectorAnalysisPackage.messages.childCurlField; }
	getPrefix()         { return "∇×"; }
};

// ─── Laplacian ∇²f or Δf ─────────────────────────────────────────────────────

function prepareDisplayLaplacianNabla(expression, context) {
	const fontSize   = context.fontInfo.size;
	const gap        = Math.round(fontSize * PREFIX_GAP_FRAC);
	const nablaWidth = Math.ceil(context.measureText("∇").width);
	
	let ordWidth, smallFontSize;
	{
		let bkp = context.fontInfo.size;
		context.fontInfo.setSizeRelative(context, SUPER_SIZE);
		smallFontSize = context.fontInfo.size;
		ordWidth      = Math.ceil(context.measureText("2").width);
		context.fontInfo.setSizeAbsolute(context, bkp);
	}
	
	let ch0 = expression.children[0];
	ch0.prepareDisplay(context);
	
	expression.horzBaseline = Math.max(Math.round(fontSize / 2), ch0.horzBaseline);
	
	expression.lpNablaWidth = nablaWidth;
	expression.lpOrdTextY   = expression.horzBaseline - Math.round(fontSize / 2) + Math.round(smallFontSize / 2);
	
	ch0.x = nablaWidth + ordWidth + gap;
	ch0.y = expression.horzBaseline - ch0.horzBaseline;
	
	expression.width        = ch0.x + ch0.width;
	expression.height       = expression.horzBaseline + Math.max(Math.round(fontSize / 2), ch0.height - ch0.horzBaseline);
	expression.vertBaseline = Math.round(expression.width / 2);
}

function displayLaplacianNabla(expression, context, x, y) {
	const fontSize = context.fontInfo.size;
	expression.drawText(context, "∇", x, y + expression.horzBaseline + Math.round(fontSize / 2));
	
	let bkp = context.fontInfo.size;
	context.fontInfo.setSizeRelative(context, SUPER_SIZE);
	expression.drawText(context, "2", x + expression.lpNablaWidth, y + expression.lpOrdTextY);
	context.fontInfo.setSizeAbsolute(context, bkp);
	
	let ch0 = expression.children[0];
	ch0.display(context, x + ch0.x, y + ch0.y);
}

function prepareDisplayLaplacianDelta(expression, context) {
	const fontSize    = context.fontInfo.size;
	const gap         = Math.round(fontSize * PREFIX_GAP_FRAC);
	const prefixWidth = Math.ceil(context.measureText("Δ").width);
	
	let ch0 = expression.children[0];
	ch0.prepareDisplay(context);
	
	expression.horzBaseline = Math.max(Math.round(fontSize / 2), ch0.horzBaseline);
	ch0.x = prefixWidth + gap;
	ch0.y = expression.horzBaseline - ch0.horzBaseline;
	
	expression.width        = ch0.x + ch0.width;
	expression.height       = expression.horzBaseline + Math.max(Math.round(fontSize / 2), ch0.height - ch0.horzBaseline);
	expression.vertBaseline = Math.round(expression.width / 2);
}

function displayLaplacianDelta(expression, context, x, y) {
	expression.drawText(context, "Δ", x, y + expression.horzBaseline + Math.round(context.fontInfo.size / 2));
	let ch0 = expression.children[0];
	ch0.display(context, x + ch0.x, y + ch0.y);
}

const Laplacian = class extends Expression {
	getTag()               { return "VectorAnalysis.Differential.Laplacian"; }
	getName()              { return VectorAnalysisPackage.messages.nameLaplacian; }
	canHaveChildren(count) { return count === 1; }
	getChildName(index)    { return VectorAnalysisPackage.messages.childLaplacianFunction; }
	
	prepareDisplay(context) {
		if (VectorAnalysisPackage.styleLaplacian === LAPLACIAN_DELTA) {
			prepareDisplayLaplacianDelta(this, context);
		}
		else {
			prepareDisplayLaplacianNabla(this, context);
		}
	}
	
	display(context, x, y) {
		if (VectorAnalysisPackage.styleLaplacian === LAPLACIAN_DELTA) {
			displayLaplacianDelta(this, context, x, y);
		}
		else {
			displayLaplacianNabla(this, context, x, y);
		}
	}
	
	moveTo(direction)        { return this.children[0].moveTo(direction); }
	moveAcross(i, direction) { return this.moveOut(direction); }
};

// ─── Norm ‖v‖ or ‖v‖_p ───────────────────────────────────────────────────────

const Norm = class extends Expression {
	getTag()               { return "VectorAnalysis.Norm"; }
	getName()              { return VectorAnalysisPackage.messages.nameNorm; }
	canHaveChildren(count) { return count === 1 || count === 2; }
	getChildName(index)    {
		return index === 0
			? VectorAnalysisPackage.messages.childNormExpression
			: VectorAnalysisPackage.messages.childNormOrder
		;
	}
	
	prepareDisplay(context) {
		const fontSize  = context.fontInfo.size;
		const gap       = Math.round(fontSize * CONTENT_GAP_FRAC);
		const lineWidth = Math.max(1, Math.round(fontSize * LINE_THICK_FRAC));
		const barWidth  = lineWidth + BAR_LINE_GAP + lineWidth;
		
		let ch0 = this.children[0];
		ch0.prepareDisplay(context);
		
		this.horzBaseline = Math.max(ch0.horzBaseline, Math.round(fontSize / 2));
		const contentH    = this.horzBaseline + Math.max(ch0.height - ch0.horzBaseline, Math.round(fontSize / 2));
		
		ch0.x = barWidth + gap;
		ch0.y = this.horzBaseline - ch0.horzBaseline;
		
		const rightBarX = ch0.x + ch0.width + gap;
		
		this.nmLineWidth = lineWidth;
		this.nmBarWidth  = barWidth;
		this.nmRightBarX = rightBarX;
		this.nmContentH  = contentH;
		
		if (this.children.length === 2) {
			let ch1 = this.children[1];
			let bkp = context.fontInfo.size;
			context.fontInfo.setSizeRelative(context, SUPER_SIZE);
			ch1.prepareDisplay(context);
			context.fontInfo.setSizeAbsolute(context, bkp);
			
			ch1.x = rightBarX + barWidth + 2;
			ch1.y = contentH - ch1.height;
			
			this.width  = ch1.x + ch1.width;
			this.height = Math.max(contentH, ch1.y + ch1.height);
		}
		else {
			this.width  = rightBarX + barWidth;
			this.height = contentH;
		}
		
		this.vertBaseline = barWidth + gap + ch0.vertBaseline;
	}
	
	display(context, x, y) {
		const lw = this.nmLineWidth;
		drawDoubleBar(context, x, y, this.nmContentH, lw);
		
		let ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
		
		drawDoubleBar(context, x + this.nmRightBarX, y, this.nmContentH, lw);
		
		if (this.children.length === 2) {
			let bkp = context.fontInfo.size;
			context.fontInfo.setSizeRelative(context, SUPER_SIZE);
			let ch1 = this.children[1];
			ch1.display(context, x + ch1.x, y + ch1.y);
			context.fontInfo.setSizeAbsolute(context, bkp);
		}
	}
	
	moveTo(direction) { return this.children[0].moveTo(direction); }
	
	moveAcross(i, direction) {
		if (this.children.length === 2) {
			if (direction === Expression.DOWN && i === 0) return this.children[1].moveTo(direction);
			if (direction === Expression.UP   && i === 1) return this.children[0].moveTo(direction);
		}
		return this.moveOut(direction);
	}
};

// ─── Inner product ⟨u, v⟩ ────────────────────────────────────────────────────

const InnerProduct = class extends Expression {
	getTag()               { return "VectorAnalysis.InnerProduct"; }
	getName()              { return VectorAnalysisPackage.messages.nameInnerProduct; }
	canHaveChildren(count) { return count === 2; }
	getChildName(index)    {
		return index === 0
			? VectorAnalysisPackage.messages.childInnerProductLeft
			: VectorAnalysisPackage.messages.childInnerProductRight;
	}
	
	prepareDisplay(context) {
		const fontSize  = context.fontInfo.size;
		const gap       = Math.round(fontSize * CONTENT_GAP_FRAC);
		const lineWidth = Math.max(1, Math.round(fontSize * LINE_THICK_FRAC));
		
		let ch0 = this.children[0];
		let ch1 = this.children[1];
		ch0.prepareDisplay(context);
		ch1.prepareDisplay(context);
		
		this.commaWidth   = Math.ceil(context.measureText(", ").width);
		this.horzBaseline = Math.max(ch0.horzBaseline, ch1.horzBaseline, Math.round(fontSize / 2));
		const contentH    = this.horzBaseline + Math.max(
			ch0.height - ch0.horzBaseline,
			ch1.height - ch1.horzBaseline,
			Math.round(fontSize / 2)
		);
		const bracketW = angleBracketWidth(contentH);
		
		this.ipBracketW  = bracketW;
		this.ipLineWidth = lineWidth;
		this.ipContentH  = contentH;
		
		ch0.x = bracketW + gap;
		ch0.y = this.horzBaseline - ch0.horzBaseline;
		
		ch1.x = ch0.x + ch0.width + this.commaWidth;
		ch1.y = this.horzBaseline - ch1.horzBaseline;
		
		this.width        = ch1.x + ch1.width + gap + bracketW;
		this.height       = contentH;
		this.vertBaseline = Math.round(this.width / 2);
	}
	
	display(context, x, y) {
		const lw = this.ipLineWidth;
		drawOpeningAngle(context, x, y, this.ipContentH, lw);
		
		let ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
		
		super.drawText(context, ", ", x + ch0.x + ch0.width, y + this.horzBaseline + Math.round(context.fontInfo.size / 2));
		
		let ch1 = this.children[1];
		ch1.display(context, x + ch1.x, y + ch1.y);
		
		drawClosingAngle(context, x + this.width - this.ipBracketW, y, this.ipContentH, lw);
	}
	
	moveTo(direction) {
		return direction === Expression.PREVIOUS
			? this.children[1].moveTo(direction)
			: this.children[0].moveTo(direction);
	}
	
	moveAcross(i, direction) {
		if (direction === Expression.NEXT     && i === 0) return this.children[1].moveTo(direction);
		if (direction === Expression.PREVIOUS && i === 1) return this.children[0].moveTo(direction);
		return this.moveOut(direction);
	}
};

// ─── Dirac.Bra ⟨ψ| ───────────────────────────────────────────────────────────

const DiracBra = class extends Expression {
	getTag()               { return "VectorAnalysis.Dirac.Bra"; }
	getName()              { return VectorAnalysisPackage.messages.nameBra; }
	canHaveChildren(count) { return count === 1; }
	getChildName(index)    { return VectorAnalysisPackage.messages.childDiracState; }
	
	prepareDisplay(context) {
		const fontSize  = context.fontInfo.size;
		const gap       = Math.round(fontSize * CONTENT_GAP_FRAC);
		const lineWidth = Math.max(1, Math.round(fontSize * LINE_THICK_FRAC));
		
		let ch0 = this.children[0];
		ch0.prepareDisplay(context);
		
		this.horzBaseline = Math.max(ch0.horzBaseline, Math.round(fontSize / 2));
		const contentH    = this.horzBaseline + Math.max(ch0.height - ch0.horzBaseline, Math.round(fontSize / 2));
		const bracketW    = angleBracketWidth(contentH);
		
		this.dbBracketW  = bracketW;
		this.dbLineWidth = lineWidth;
		this.dbContentH  = contentH;
		
		ch0.x        = bracketW + gap;
		ch0.y        = this.horzBaseline - ch0.horzBaseline;
		this.dbPipeX = ch0.x + ch0.width + gap;
		
		this.width        = this.dbPipeX + lineWidth;
		this.height       = contentH;
		this.vertBaseline = bracketW + gap + ch0.vertBaseline;
	}
	
	display(context, x, y) {
		const lw = this.dbLineWidth;
		drawOpeningAngle(context, x, y, this.dbContentH, lw);
		let ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
		drawPipe(context, x + this.dbPipeX, y, this.dbContentH, lw);
	}
	
	moveTo(direction)        { return this.children[0].moveTo(direction); }
	moveAcross(i, direction) { return this.moveOut(direction); }
};

// ─── Dirac.Ket |φ⟩ ───────────────────────────────────────────────────────────

const DiracKet = class extends Expression {
	getTag()               { return "VectorAnalysis.Dirac.Ket"; }
	getName()              { return VectorAnalysisPackage.messages.nameKet; }
	canHaveChildren(count) { return count === 1; }
	getChildName(index)    { return VectorAnalysisPackage.messages.childDiracState; }
	
	prepareDisplay(context) {
		const fontSize  = context.fontInfo.size;
		const gap       = Math.round(fontSize * CONTENT_GAP_FRAC);
		const lineWidth = Math.max(1, Math.round(fontSize * LINE_THICK_FRAC));
		
		let ch0 = this.children[0];
		ch0.prepareDisplay(context);
		
		this.horzBaseline = Math.max(ch0.horzBaseline, Math.round(fontSize / 2));
		const contentH    = this.horzBaseline + Math.max(ch0.height - ch0.horzBaseline, Math.round(fontSize / 2));
		const bracketW    = angleBracketWidth(contentH);
		
		this.dkBracketW  = bracketW;
		this.dkLineWidth = lineWidth;
		this.dkContentH  = contentH;
		
		ch0.x = lineWidth + gap;
		ch0.y = this.horzBaseline - ch0.horzBaseline;
		
		this.width        = lineWidth + gap + ch0.width + gap + bracketW;
		this.height       = contentH;
		this.vertBaseline = lineWidth + gap + ch0.vertBaseline;
	}
	
	display(context, x, y) {
		const lw = this.dkLineWidth;
		drawPipe(context, x, y, this.dkContentH, lw);
		let ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
		drawClosingAngle(context, x + this.width - this.dkBracketW, y, this.dkContentH, lw);
	}
	
	moveTo(direction)        { return this.children[0].moveTo(direction); }
	moveAcross(i, direction) { return this.moveOut(direction); }
};

// ─── Dirac.Braket ⟨ψ|φ⟩ ─────────────────────────────────────────────────────

const DiracBraket = class extends Expression {
	getTag()               { return "VectorAnalysis.Dirac.Braket"; }
	getName()              { return VectorAnalysisPackage.messages.nameBraket; }
	canHaveChildren(count) { return count === 2; }
	getChildName(index)    {
		return index === 0
			? VectorAnalysisPackage.messages.childBraketBra
			: VectorAnalysisPackage.messages.childBraketKet;
	}
	
	prepareDisplay(context) {
		const fontSize  = context.fontInfo.size;
		const gap       = Math.round(fontSize * CONTENT_GAP_FRAC);
		const lineWidth = Math.max(1, Math.round(fontSize * LINE_THICK_FRAC));
		
		let ch0 = this.children[0];
		let ch1 = this.children[1];
		ch0.prepareDisplay(context);
		ch1.prepareDisplay(context);
		
		this.horzBaseline = Math.max(ch0.horzBaseline, ch1.horzBaseline, Math.round(fontSize / 2));
		const contentH    = this.horzBaseline + Math.max(
			ch0.height - ch0.horzBaseline,
			ch1.height - ch1.horzBaseline,
			Math.round(fontSize / 2)
		);
		const bracketW = angleBracketWidth(contentH);
		
		this.bkBracketW  = bracketW;
		this.bkLineWidth = lineWidth;
		this.bkContentH  = contentH;
		
		ch0.x        = bracketW + gap;
		ch0.y        = this.horzBaseline - ch0.horzBaseline;
		this.bkPipeX = ch0.x + ch0.width + gap;
		
		ch1.x = this.bkPipeX + lineWidth + gap;
		ch1.y = this.horzBaseline - ch1.horzBaseline;
		
		this.width        = ch1.x + ch1.width + gap + bracketW;
		this.height       = contentH;
		this.vertBaseline = Math.round(this.width / 2);
	}
	
	display(context, x, y) {
		const lw = this.bkLineWidth;
		drawOpeningAngle(context, x, y, this.bkContentH, lw);
		
		let ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
		
		drawPipe(context, x + this.bkPipeX, y, this.bkContentH, lw);
		
		let ch1 = this.children[1];
		ch1.display(context, x + ch1.x, y + ch1.y);
		
		drawClosingAngle(context, x + this.width - this.bkBracketW, y, this.bkContentH, lw);
	}
	
	moveTo(direction) {
		return direction === Expression.PREVIOUS
			? this.children[1].moveTo(direction)
			: this.children[0].moveTo(direction);
	}
	
	moveAcross(i, direction) {
		if (direction === Expression.NEXT     && i === 0) return this.children[1].moveTo(direction);
		if (direction === Expression.PREVIOUS && i === 1) return this.children[0].moveTo(direction);
		return this.moveOut(direction);
	}
};

// ─── Registration ─────────────────────────────────────────────────────────────

VectorAnalysisPackage.setExpressions = function(module) {
	Formulae.setExpression(module, "VectorAnalysis.Differential.Gradient",  Gradient);
	Formulae.setExpression(module, "VectorAnalysis.Differential.Divergence", Divergence);
	Formulae.setExpression(module, "VectorAnalysis.Differential.Curl",       Curl);
	Formulae.setExpression(module, "VectorAnalysis.Differential.Laplacian",  Laplacian);
	Formulae.setExpression(module, "VectorAnalysis.Norm",                    Norm);
	Formulae.setExpression(module, "VectorAnalysis.InnerProduct",            InnerProduct);
	Formulae.setExpression(module, "VectorAnalysis.Dirac.Bra",               DiracBra);
	Formulae.setExpression(module, "VectorAnalysis.Dirac.Ket",               DiracKet);
	Formulae.setExpression(module, "VectorAnalysis.Dirac.Braket",            DiracBraket);
};

VectorAnalysisPackage.isConfigurable = () => true;

VectorAnalysisPackage.onConfiguration = function() {
	let table = document.createElement("table");
	table.classList.add("bordered");
	
	let row, th, col, radio;
	
	row = table.insertRow();
	th  = document.createElement("th");
	th.appendChild(document.createTextNode(VectorAnalysisPackage.messages.preferenceLaplacianTitle));
	row.appendChild(th);
	
	row = table.insertRow();
	col = row.insertCell();
	
	radio = document.createElement("input"); radio.type = "radio"; radio.name = "laplacian"; radio.value = LAPLACIAN_NABLA;
	radio.checked = (radio.value == VectorAnalysisPackage.styleLaplacian);
	col.appendChild(radio);
	col.appendChild(document.createTextNode(VectorAnalysisPackage.messages.preferenceLaplacianNabla));
	
	col.appendChild(document.createElement("br"));
	
	radio = document.createElement("input"); radio.type = "radio"; radio.name = "laplacian"; radio.value = LAPLACIAN_DELTA;
	radio.checked = (radio.value == VectorAnalysisPackage.styleLaplacian);
	col.appendChild(radio);
	col.appendChild(document.createTextNode(VectorAnalysisPackage.messages.preferenceLaplacianDelta));
	
	row = table.insertRow();
	th  = document.createElement("th");
	const button = document.createElement("button");
	button.innerText = "Ok";
	button.addEventListener("click", () => VectorAnalysisPackage.onChangeStyle());
	th.appendChild(button);
	row.appendChild(th);
	
	Formulae.setModal(table);
};

VectorAnalysisPackage.onChangeStyle = function() {
	let laplacian = document.querySelector('input[name="laplacian"]:checked');
	if (laplacian) VectorAnalysisPackage.styleLaplacian = parseInt(laplacian.value);
	Formulae.resetModal();
	Formulae.refreshHandlers();
};

