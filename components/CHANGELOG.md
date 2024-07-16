# Changelog

## [0.5.6](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.5...dashboard-components-v0.5.6) (2024-07-16)


### Features

* **components:** number of sequences over time: implement line chart view ([b5a5cb3](https://github.com/GenSpectrum/dashboard-components/commit/b5a5cb35d710899be477f8260c08e81337d7ed7b)), closes [#317](https://github.com/GenSpectrum/dashboard-components/issues/317)

## [0.5.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.4...dashboard-components-v0.5.5) (2024-07-15)


### Features

* **components:** add new component that shows the number of sequences over time ([32f4dcd](https://github.com/GenSpectrum/dashboard-components/commit/32f4dcd1a0ca142c83b57323edb05da8d765aac9)), closes [#327](https://github.com/GenSpectrum/dashboard-components/issues/327)
* **components:** number of sequences over time: compute data ([ccd27d6](https://github.com/GenSpectrum/dashboard-components/commit/ccd27d6984fcad2dc9407d25a27452fbcbc5695e)), closes [#327](https://github.com/GenSpectrum/dashboard-components/issues/327)
* **components:** number of sequences over time: implement bar chart view ([dba386c](https://github.com/GenSpectrum/dashboard-components/commit/dba386ce6195716b40e1ad961e35b2b72b64a6f7)), closes [#316](https://github.com/GenSpectrum/dashboard-components/issues/316)
* **components:** number of sequences over time: implement table view ([b52021a](https://github.com/GenSpectrum/dashboard-components/commit/b52021a7270e773721f0e23ef82368fa29f81507)), closes [#318](https://github.com/GenSpectrum/dashboard-components/issues/318)

## [0.5.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.3...dashboard-components-v0.5.4) (2024-07-15)


### Features

* **components:** mutation filter: add explanation to info box ([361a519](https://github.com/GenSpectrum/dashboard-components/commit/361a5196bdc06cc14cf85d556f11d7b54310cb47)), closes [#182](https://github.com/GenSpectrum/dashboard-components/issues/182)

## [0.5.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.2...dashboard-components-v0.5.3) (2024-07-12)


### Bug Fixes

* **components:** mutation filter: `initialValue` must be of `type Object` ([6837704](https://github.com/GenSpectrum/dashboard-components/commit/683770414e46a1b80133f673e71a77e01af151e4))

## [0.5.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.1...dashboard-components-v0.5.2) (2024-07-10)


### Bug Fixes

* **components:** prevalence over time: bar chart disappeared when selecting "None" confidence interval [#311](https://github.com/GenSpectrum/dashboard-components/issues/311) ([0f3cec2](https://github.com/GenSpectrum/dashboard-components/commit/0f3cec2d8b2dbec1389df6d0bc3b32504f01a501))

## [0.5.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.0...dashboard-components-v0.5.1) (2024-07-02)


### Features

* **components:** reduce the smallest size of the date picker ([4c9b51e](https://github.com/GenSpectrum/dashboard-components/commit/4c9b51e6d24b7e3ac959dd980aa2fab1b1ff429a))


### Bug Fixes

* **components:** correct sorting with null values in gs-aggregate ([83ba9c3](https://github.com/GenSpectrum/dashboard-components/commit/83ba9c39924efc524f406f355965cb562d0a6c73))

## [0.5.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.4.5...dashboard-components-v0.5.0) (2024-06-28)


### ⚠ BREAKING CHANGES

* **components:** renaming of props to components
    * gs-mutation-comparison: variants -> lapisFilter
    * gs-mutations: variant -> lapisFilter
    * gs-prevalence-over-time: numerator -> numeratorFilter, denominator -> denominatorFilter
    * gs-relative-growth-advantage: numerator -> numeratorFilter, denominator -> denominatorFilter

### Features

* **components:** make y-axis max value configurable ([87b2d6c](https://github.com/GenSpectrum/dashboard-components/commit/87b2d6c84c0eb4976f916696dd536e38bd208293))
* **components:** more prominent relative growth advantage value display ([a73bec9](https://github.com/GenSpectrum/dashboard-components/commit/a73bec9f4abf00d2dbf131416e3dcea4910bace2))
* **components:** show unknown date only in bar chart and table in prevalence-over-time ([956d1a7](https://github.com/GenSpectrum/dashboard-components/commit/956d1a7ba0d713aceb6d7f0145614adf313ade06))


### Code Refactoring

* **components:** rename (almost) all occurrences of variant to lapisFilter, or dataset ([b991df7](https://github.com/GenSpectrum/dashboard-components/commit/b991df7c1e8ca398d0d882c2a90376df2c0311a4))

## [0.4.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.4.4...dashboard-components-v0.4.5) (2024-06-19)


### Features

* **components:** allow to set pagination limit for all tables ([887a230](https://github.com/GenSpectrum/dashboard-components/commit/887a23067c13a01a3fa32afc7fba2e71a5c8d8ec))
* **components:** placeholderText for location-filter ([43cfd81](https://github.com/GenSpectrum/dashboard-components/commit/43cfd81b37c81564f92f59edec2ef223dc7be9ac))

## [0.4.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.4.3...dashboard-components-v0.4.4) (2024-06-18)


### Features

* **components:** initial sorting of aggregate table ([8f27235](https://github.com/GenSpectrum/dashboard-components/commit/8f272358853c4a7bc351230672430e5e4642cf84))

## [0.4.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.4.2...dashboard-components-v0.4.3) (2024-06-12)


### Bug Fixes

* **components:** remove date range selector fixed height for responsive design ([3db6a2f](https://github.com/GenSpectrum/dashboard-components/commit/3db6a2fc11084946d6e405ee2e437786ec2b6ee5))

## [0.4.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.4.1...dashboard-components-v0.4.2) (2024-05-29)


### Features

* **components:** location filter dispatches event when empty input ([d459cc2](https://github.com/GenSpectrum/dashboard-components/commit/d459cc2952b2668f326311da99aec9c2ff5705ca))
* **components:** text-input dispatches event when empty input ([7ada890](https://github.com/GenSpectrum/dashboard-components/commit/7ada890eaf0be7a927ae5d5bc3e3159579e3cfb4))

## [0.4.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.4.0...dashboard-components-v0.4.1) (2024-05-28)


### Features

* **components:** mobile friendly tabs [#234](https://github.com/GenSpectrum/dashboard-components/issues/234) ([f91454b](https://github.com/GenSpectrum/dashboard-components/commit/f91454bed4885c9e29efe25c60c9abd8344b18f6))
* **components:** responsive date range selector ([be7a15e](https://github.com/GenSpectrum/dashboard-components/commit/be7a15e38d744bb5f0b93d89d9f38d197c856544))

## [0.4.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.3.2...dashboard-components-v0.4.0) (2024-05-28)


### ⚠ BREAKING CHANGES

* **components:** Remove height attribute from mutation filter object. It now adapts to the height of the containing objects.

### Features

* **components:** adjust width of info for small screens ([d7f61c7](https://github.com/GenSpectrum/dashboard-components/commit/d7f61c7c0e95201aafb854e1f08d69ce7fd7bcff))
* **components:** change design of mutation filter ([49e9b04](https://github.com/GenSpectrum/dashboard-components/commit/49e9b044249841417284d7be3c1033cadec3a51b))
* **components:** gs-date-range-selector: add attributes `initialDateFrom`, `initialDateTo` [#245](https://github.com/GenSpectrum/dashboard-components/issues/245) ([c944011](https://github.com/GenSpectrum/dashboard-components/commit/c944011ebcb8bb45542e33b8b95454a717584833))
* **components:** gs-location-filter: set all values in `gs-location-changed` event details [#265](https://github.com/GenSpectrum/dashboard-components/issues/265) ([4fce642](https://github.com/GenSpectrum/dashboard-components/commit/4fce64231db867974de9d7f566c73fcb172d803c))
* **components:** mobile friendly info object [#235](https://github.com/GenSpectrum/dashboard-components/issues/235) ([c37423e](https://github.com/GenSpectrum/dashboard-components/commit/c37423ee14e8e6ec8cbe38a5e0f93b9bc7e80c64))


### Bug Fixes

* **components:** `gs-date-range-selector`: set initial `dateFrom` and `dateTo` values from `initialValue` [#245](https://github.com/GenSpectrum/dashboard-components/issues/245) ([1c060f7](https://github.com/GenSpectrum/dashboard-components/commit/1c060f7861c5863648d054bb8296d9beec513dfc))

## [0.3.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.3.1...dashboard-components-v0.3.2) (2024-05-27)


### Features

* **components:** make x-axis date field of `gs-prevalence-over-time` configurable [#215](https://github.com/GenSpectrum/dashboard-components/issues/215) ([e06cc11](https://github.com/GenSpectrum/dashboard-components/commit/e06cc116f7f73dc1149e1ae20bf4c8c5df10a9ac))
* **components:** make x-axis date field of `gs-relative-growth-advantage` configurable [#215](https://github.com/GenSpectrum/dashboard-components/issues/215) ([947f072](https://github.com/GenSpectrum/dashboard-components/commit/947f072e2d99e44a1c7ffde41ace997d5eb8d332))

## [0.3.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.3.0...dashboard-components-v0.3.1) (2024-05-23)


### Features

* **components:** gs-location-filter: remove submit button [#250](https://github.com/GenSpectrum/dashboard-components/issues/250) ([0042d21](https://github.com/GenSpectrum/dashboard-components/commit/0042d21053bba3eac2f370cb109430c277f5bf1b))

## [0.3.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.2.0...dashboard-components-v0.3.0) (2024-05-22)


### ⚠ BREAKING CHANGES

* **components:** the `numerator` attribute of `gs-prevalence-over-time` is now a nested object with separate keys for the `displayName` and the `lapisFilter`
* **components:** remove size property from components and use width and height #237

### Features

* **components:** configurable target column for date range selector ([57aa58e](https://github.com/GenSpectrum/dashboard-components/commit/57aa58e2b10be4222f97bcd1c2605a4f028e3031))
* **components:** make NamedLapisFilter a nested type [#209](https://github.com/GenSpectrum/dashboard-components/issues/209) ([332ebc1](https://github.com/GenSpectrum/dashboard-components/commit/332ebc129fd72bd66e6619f77ff77af919650c9b))
* **components:** move width and height outside of size property ([432a7ed](https://github.com/GenSpectrum/dashboard-components/commit/432a7edf883cbdae19ee67fc5aebd9558d9b98e6))


### Bug Fixes

* **components:** `gs-location-filter`: show better error [#75](https://github.com/GenSpectrum/dashboard-components/issues/75) ([187f9e7](https://github.com/GenSpectrum/dashboard-components/commit/187f9e7eae5f7ba2613d8e45398beb4c426a1a6a))

## [0.2.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.1.5...dashboard-components-v0.2.0) (2024-05-16)


### ⚠ BREAKING CHANGES

* **components:** rename components: gs-aggregate-component to gs-aggregate, gs-mutation-comparison-component to gs-mutation-comparison, gs-mutations-component to gs-mutations

### Features

* **components:** add error boundary to components ([0921b81](https://github.com/GenSpectrum/dashboard-components/commit/0921b8104ec8de7d4edbf1b002fb4057957fd16a))
* **components:** unify custom element names ([047c84e](https://github.com/GenSpectrum/dashboard-components/commit/047c84e598d95d6bde06ff6217bb536ce3de0cda))

## [0.1.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.1.4...dashboard-components-v0.1.5) (2024-05-15)


### Features

* **components:** info button opens a scrollable info panel ([7a632ae](https://github.com/GenSpectrum/dashboard-components/commit/7a632aefcc12ddf8a885da71cbc6a9c947545ebe))
* **components:** optional configurable headline of components ([e136b37](https://github.com/GenSpectrum/dashboard-components/commit/e136b37ded4abd67ea19d3ad5a5b35258d7e8fc1))

## [0.1.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.1.3...dashboard-components-v0.1.4) (2024-05-13)


### Features

* **components:** all input components should have a `initialValue` attribute ([2c76e88](https://github.com/GenSpectrum/dashboard-components/commit/2c76e88b061d8d67d502b176f42e0a5ad0e1d3c5))
* **components:** disable dark mode in daisyui ([4439c78](https://github.com/GenSpectrum/dashboard-components/commit/4439c783221865dbbcb5c259ee9e33ead903ad39))
* **components:** set size of display components or resize to fit container [#191](https://github.com/GenSpectrum/dashboard-components/issues/191) ([5019cfe](https://github.com/GenSpectrum/dashboard-components/commit/5019cfe7d8bddfee8e738ae6854cd641cca96072))


### Bug Fixes

* **components:** show an info element on mutation filter [#157](https://github.com/GenSpectrum/dashboard-components/issues/157) ([04d08b9](https://github.com/GenSpectrum/dashboard-components/commit/04d08b9a87226279bb0d376ad6b63db71e9f3f78))

## [0.1.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.1.2...dashboard-components-v0.1.3) (2024-04-25)


### Features

* **components:** new aggregate table component ([ab73048](https://github.com/GenSpectrum/dashboard-components/commit/ab73048404110964826867368fcd8e5c4dc6c047)), closes [#158](https://github.com/GenSpectrum/dashboard-components/issues/158)

## [0.1.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.1.1...dashboard-components-v0.1.2) (2024-04-24)


### Bug Fixes

* **components:** configure public access for scoped packages ([e053282](https://github.com/GenSpectrum/dashboard-components/commit/e05328215cae1cf5f07f69672a8a71c0e913de78))
* **components:** make package public ([5fbf6b9](https://github.com/GenSpectrum/dashboard-components/commit/5fbf6b9d553639414fad913005def368c2f5a8c3))

## [0.1.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.1.0...dashboard-components-v0.1.1) (2024-04-24)


### Features

* **components:** indicate error on wrong mutation filter input [#156](https://github.com/GenSpectrum/dashboard-components/issues/156) ([b5e39c7](https://github.com/GenSpectrum/dashboard-components/commit/b5e39c73136d01071ea7db87f027d730ec9fa286))

## [0.1.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.0.1...dashboard-components-v0.1.0) (2024-04-24)


### Features

* add logarithmic and logistic scale to prevalence over time charts ([57df325](https://github.com/GenSpectrum/dashboard-components/commit/57df3253492930519efe61095e46b299cfee37b1))
* **components:** add a bubble chart to prevalence over time ([c6cc540](https://github.com/GenSpectrum/dashboard-components/commit/c6cc540650fd607a646b380848389fd158e75b82))
* **components:** add confidence intervals to line and bar chart [#111](https://github.com/GenSpectrum/dashboard-components/issues/111) ([7243c6d](https://github.com/GenSpectrum/dashboard-components/commit/7243c6d620562de920938cf71d0ebb6c8c6b2535))
* **components:** add date range selector and unify selector component ([ee3167b](https://github.com/GenSpectrum/dashboard-components/commit/ee3167b1d93cc26b1a934882aa55bc06eea40c20)), closes [#9](https://github.com/GenSpectrum/dashboard-components/issues/9)
* **components:** add download button to mutation comparison ([574d131](https://github.com/GenSpectrum/dashboard-components/commit/574d1312aa379eb6d931b54b80d156bd59dcd495))
* **components:** add download button to mutations [#60](https://github.com/GenSpectrum/dashboard-components/issues/60) ([f414205](https://github.com/GenSpectrum/dashboard-components/commit/f414205252e8287c38753b028ed23fdf1c2433b6))
* **components:** add gs-date-range-changed event to date range selector ([b4f43c7](https://github.com/GenSpectrum/dashboard-components/commit/b4f43c7a43427b8c059802e425d82751eb5edd7b))
* **components:** add insertion tab for mutations component ([7259feb](https://github.com/GenSpectrum/dashboard-components/commit/7259febe121377c20e5418da033d43cf92d731b6))
* **components:** add mutation comparison venn diagram ([c490020](https://github.com/GenSpectrum/dashboard-components/commit/c490020a6b511d5a81d80c4d7be58a9c1778eb95))
* **components:** add mutation comparison with table ([eadd9a7](https://github.com/GenSpectrum/dashboard-components/commit/eadd9a717790e5ca5b9616b9fcaac0116bad9a87))
* **components:** add mutation filter component ([#149](https://github.com/GenSpectrum/dashboard-components/issues/149)) ([49c2f9a](https://github.com/GenSpectrum/dashboard-components/commit/49c2f9a4665ad111a669e921cfb6e000e80c36ba))
* **components:** add proportion selector ([59d785b](https://github.com/GenSpectrum/dashboard-components/commit/59d785b531144cbb4a00dddd6c778e3a4e4d07bf))
* **components:** add proportion selector to mutations ([74cfdac](https://github.com/GenSpectrum/dashboard-components/commit/74cfdac468e58e0fe740ddbd9c574885219f3611))
* **components:** add scale selector to relative growth advantage ([564bec9](https://github.com/GenSpectrum/dashboard-components/commit/564bec93131e71c09371df16c664004c20c03fa3)), closes [#67](https://github.com/GenSpectrum/dashboard-components/issues/67)
* **components:** add text input ([5e1b601](https://github.com/GenSpectrum/dashboard-components/commit/5e1b601cfbb6d4e6c412266da33071fa420fb5bf))
* **components:** allow filter by mutation type for mutations tab ([aea2a4f](https://github.com/GenSpectrum/dashboard-components/commit/aea2a4f19d3206b7555b063111314906a496e781))
* **components:** bring back the custom-elements-manifest analyzer [#34](https://github.com/GenSpectrum/dashboard-components/issues/34) ([1e198b1](https://github.com/GenSpectrum/dashboard-components/commit/1e198b1b290dfab1fb4ad8b6c2580a6d908925fb))
* **components:** build and use components in a separate index.html [#35](https://github.com/GenSpectrum/dashboard-components/issues/35) ([0a95979](https://github.com/GenSpectrum/dashboard-components/commit/0a95979b558e3ce91071258864ec1cd233ba3f7a))
* **components:** change prevalence over time tab labels ([f0914e3](https://github.com/GenSpectrum/dashboard-components/commit/f0914e3da4ddfe71385a5354aea1e6714e2214c4))
* **components:** disable chart animations ([ac65124](https://github.com/GenSpectrum/dashboard-components/commit/ac651243b6d15832c84a69e0b308827599e6f5d4))
* **components:** hide scaling selector on tab view in prevalence over time ([23c10b2](https://github.com/GenSpectrum/dashboard-components/commit/23c10b2e1ae20f444f1a1be93c12ad288e93deaf)), closes [#88](https://github.com/GenSpectrum/dashboard-components/issues/88)
* **components:** implement button to download prevalence over time data as CSV [#61](https://github.com/GenSpectrum/dashboard-components/issues/61) ([08e7fea](https://github.com/GenSpectrum/dashboard-components/commit/08e7fea62ac5a1b8770c5dfa39ace65256f5b9e5))
* **components:** migrate inner lit components to preact ([7980cc7](https://github.com/GenSpectrum/dashboard-components/commit/7980cc7ef60b1d9df513d9ae5f074d4618201e9d))
* **components:** move date range selector to preact ([ec3b244](https://github.com/GenSpectrum/dashboard-components/commit/ec3b2447deb43f34e276c4fee8503d450870e008))
* **components:** mutation comparison: allow user to filter data by substitution/deletion [#109](https://github.com/GenSpectrum/dashboard-components/issues/109) ([ba3256f](https://github.com/GenSpectrum/dashboard-components/commit/ba3256f6aff11b8f6397f32b94c1cb6e9c191f0a))
* **components:** mutation comparison: allow user to set min/max proportions [#108](https://github.com/GenSpectrum/dashboard-components/issues/108) ([8915b0f](https://github.com/GenSpectrum/dashboard-components/commit/8915b0fd7f0ad525c0f1695dcda6528f77e9aee5))
* **components:** provide reference genome to all components ([6e66e2d](https://github.com/GenSpectrum/dashboard-components/commit/6e66e2d31e9585d83a997c626840d6a2b62ce09b))
* **components:** set minimal proportion on MutationComparison to 50% [#97](https://github.com/GenSpectrum/dashboard-components/issues/97) ([cb72cc9](https://github.com/GenSpectrum/dashboard-components/commit/cb72cc91381697052557e8a6cdfa66920ca8b6f6))
* **components:** show tooltip count and total count on bubble plot to first digit ([57aafc3](https://github.com/GenSpectrum/dashboard-components/commit/57aafc34b0334418477d2deba5dc0a91447d0994)), closes [#25](https://github.com/GenSpectrum/dashboard-components/issues/25)
* **components:** use explicit format of insertions and mutations ([29a7af0](https://github.com/GenSpectrum/dashboard-components/commit/29a7af06e086142dc5adf6e6b7eda123dc90901b))
* **components:** use gridjs for mutation table ([0c9134a](https://github.com/GenSpectrum/dashboard-components/commit/0c9134a22ef70b2f9a430ed320e80fab0523fa0f)), closes [#16](https://github.com/GenSpectrum/dashboard-components/issues/16)
* **components:** use label of tooltip for footnote in Venn diagram ([59fc545](https://github.com/GenSpectrum/dashboard-components/commit/59fc5454191e97320320316230bb2cdd6fda536e))
* **components:** use lapis 2 ([db5d155](https://github.com/GenSpectrum/dashboard-components/commit/db5d1559030bae9ca3e8845fd68ec864f66148a8))
* **components:** use percent format for all table columns with prevalence ([b767669](https://github.com/GenSpectrum/dashboard-components/commit/b7676694cc4901c809a1e82d7737ede3d22c0e26))
* **components:** use play function to select venn diagram tab ([6586ab1](https://github.com/GenSpectrum/dashboard-components/commit/6586ab198705793f57040e25b40d3406d72eb98b))
* **examples:** add example React app to demonstrate how to use the components [#133](https://github.com/GenSpectrum/dashboard-components/issues/133) ([1d6c53b](https://github.com/GenSpectrum/dashboard-components/commit/1d6c53b9d73353294328d6d388f0370f2c70bb68))
* implement autocomplete for location filter [#69](https://github.com/GenSpectrum/dashboard-components/issues/69) ([0f94c08](https://github.com/GenSpectrum/dashboard-components/commit/0f94c089539fe9b7088f97422d6eb370184f2543))
* implement custom event when location filter is submitted [#70](https://github.com/GenSpectrum/dashboard-components/issues/70) ([3b07d5b](https://github.com/GenSpectrum/dashboard-components/commit/3b07d5b80ac459e8d0f3c0f8917cf9a96fa5c800))
* show count in "prevalence over time" table [#18](https://github.com/GenSpectrum/dashboard-components/issues/18) ([b547c11](https://github.com/GenSpectrum/dashboard-components/commit/b547c11a86b6ac69b02d4999862fdecf6624bbe3))
* use constant for LAPIS url in stories ([a3c2a03](https://github.com/GenSpectrum/dashboard-components/commit/a3c2a03bfc0994873ced1d46701a389307efb095))
* use scale type for each tab separately ([773da95](https://github.com/GenSpectrum/dashboard-components/commit/773da9561aa8d08cf2f3d7b12e925f5721cd703d))


### Bug Fixes

* **components:** bugs in the temporal functions ([40b1cd7](https://github.com/GenSpectrum/dashboard-components/commit/40b1cd7c86b0408bba4a7644b3bf93f9dbb3cf34))
* **components:** export MutationFilterComponent ([51adefd](https://github.com/GenSpectrum/dashboard-components/commit/51adefd029e3312f9805ad958b573ca2bd1b0252))
* **components:** fix types of logit scale [#144](https://github.com/GenSpectrum/dashboard-components/issues/144) ([23c0b57](https://github.com/GenSpectrum/dashboard-components/commit/23c0b572748fc514972a1b22defe6592c2526f66))
* **components:** move flaky date range test to playwright ([74308f3](https://github.com/GenSpectrum/dashboard-components/commit/74308f33686580b34bcd9c3280820864f36861db))
* **components:** show correct granularity on prevalence over time table ([7897059](https://github.com/GenSpectrum/dashboard-components/commit/7897059d50b49f8e07a841a1080dae295163160e)), closes [#27](https://github.com/GenSpectrum/dashboard-components/issues/27)
* **components:** show mutations on grid view, when one of the proportions is in the proportionInterval ([5c4672b](https://github.com/GenSpectrum/dashboard-components/commit/5c4672ba99b3d975bd69de29fbbb52d760daa3fa))
* **components:** SlidingOperator when windowSize is greater than dataset [#26](https://github.com/GenSpectrum/dashboard-components/issues/26) ([2b9f951](https://github.com/GenSpectrum/dashboard-components/commit/2b9f9519ed5edc4fc3cb0c4a3ee979720e98ad05))
* **components:** sort mutation comparison table by position ([15dc4f2](https://github.com/GenSpectrum/dashboard-components/commit/15dc4f27b872be70d9f9c232b7ea88f5a355780d))
* import dayjs plugins from esm not directly ([203a219](https://github.com/GenSpectrum/dashboard-components/commit/203a219063d49725b76f3cc8cf5ae2970834b80f))
* make css fully available for tailwind and daisyui ([94c0a93](https://github.com/GenSpectrum/dashboard-components/commit/94c0a9396ebc919ca5250efcab167bc9cd2034d6))
* workaround for missing module declaration ([e212e3c](https://github.com/GenSpectrum/dashboard-components/commit/e212e3c471425c075b1761a40199deaaf61a7762))
