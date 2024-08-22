"use strict";
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[763],{

/***/ 3763:
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VerifySignature: function() { return /* binding */ VerifySignature; }
/* harmony export */ });
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

// Your signature and public key
class VerifySignature extends o1js__WEBPACK_IMPORTED_MODULE_0__/* .SmartContract */ .C3 {
    constructor() {
        super(...arguments);
        this.counter = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)(0);
    }
    async verifySignature(publicKey, signature, messageField) {
        // Reconstruct the message array
        const message = [messageField];
        // Verify the signature
        const isValid = signature.verify(publicKey, message);
        // Assert that the signature is valid
        isValid.assertEquals((0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Bool */ .tW)(true));
        // Assert that the public input matches the message
    }
}
__decorate([
    (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .state */ .SB)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN),
    __metadata("design:type", Object)
], VerifySignature.prototype, "counter", void 0);
__decorate([
    o1js__WEBPACK_IMPORTED_MODULE_0__/* .method */ .UD,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js__WEBPACK_IMPORTED_MODULE_0__/* .PublicKey */ .nh, o1js__WEBPACK_IMPORTED_MODULE_0__/* .Signature */ .Pc, o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN]),
    __metadata("design:returntype", Promise)
], VerifySignature.prototype, "verifySignature", null);
//# sourceMappingURL=Verify.js.map

/***/ })

}]);