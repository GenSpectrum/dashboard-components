# Changelog

## [0.19.9](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.8...dashboard-components-v0.19.9) (2025-06-05)


### Bug Fixes

* **components:** gs-mutations name in type declarations ([#899](https://github.com/GenSpectrum/dashboard-components/issues/899)) ([19cc2f9](https://github.com/GenSpectrum/dashboard-components/commit/19cc2f9dfe40f6682245c41357ba5faaa0e65fef))

## [0.19.8](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.7...dashboard-components-v0.19.8) (2025-05-14)


### Features

* **components:** show counts on lineage filter ([#886](https://github.com/GenSpectrum/dashboard-components/issues/886)) ([5c23029](https://github.com/GenSpectrum/dashboard-components/commit/5c23029f15e99bf92460a2295ea70a527a5d88af)), closes [#663](https://github.com/GenSpectrum/dashboard-components/issues/663)

## [0.19.7](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.6...dashboard-components-v0.19.7) (2025-05-14)


### Features

* **components:** export number filter events ([#890](https://github.com/GenSpectrum/dashboard-components/issues/890)) ([ad4707b](https://github.com/GenSpectrum/dashboard-components/commit/ad4707b2139069b8e07d3e085c9c1398eaf10088))


### Bug Fixes

* **components:** fix type of event for gs-number-range-filter in docs ([#888](https://github.com/GenSpectrum/dashboard-components/issues/888)) ([3f676b2](https://github.com/GenSpectrum/dashboard-components/commit/3f676b2ecb45d1f8ef52c9376f9c580a9c849446))

## [0.19.6](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.5...dashboard-components-v0.19.6) (2025-05-08)


### Features

* **components:** fire `gs-component-finished-loading` event when visualization components are likely to trigger no layout shifts anymore ([#880](https://github.com/GenSpectrum/dashboard-components/issues/880)) ([ce5d4e0](https://github.com/GenSpectrum/dashboard-components/commit/ce5d4e01435624b2b62018d9377647664c510b02)), closes [#860](https://github.com/GenSpectrum/dashboard-components/issues/860)

## [0.19.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.4...dashboard-components-v0.19.5) (2025-05-05)


### Features

* **components:** add mutation filter to gs-wastewater-mutations-over-time ([#875](https://github.com/GenSpectrum/dashboard-components/issues/875)) ([b05a807](https://github.com/GenSpectrum/dashboard-components/commit/b05a8078676595ae47192bbfd86a8262b207e98c)), closes [#866](https://github.com/GenSpectrum/dashboard-components/issues/866)
* **components:** export input type of NumberRangeFilter ([#876](https://github.com/GenSpectrum/dashboard-components/issues/876)) ([05c7a3f](https://github.com/GenSpectrum/dashboard-components/commit/05c7a3fc05eaad3ff96c58bfb38b2afe497dbb0f))

## [0.19.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.3...dashboard-components-v0.19.4) (2025-04-30)


### Features

* **components:** remove quotes from CDS name ([#873](https://github.com/GenSpectrum/dashboard-components/issues/873)) ([80517f6](https://github.com/GenSpectrum/dashboard-components/commit/80517f6eea53343cef838112b9883f7bbda404b8))
* **components:** add new component `gs-number-range-filter` ([#761](https://github.com/GenSpectrum/dashboard-components/issues/761)) ([ca247dd](https://github.com/GenSpectrum/dashboard-components/commit/ca247dd07c38dcaadcd741d934a45fb681cf5b73))

## [0.19.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.2...dashboard-components-v0.19.3) (2025-04-25)


### Features

* **components:** add a genome-data-viewer ([#814](https://github.com/GenSpectrum/dashboard-components/issues/814)) ([37cd299](https://github.com/GenSpectrum/dashboard-components/commit/37cd29980b4d54701d4aea44e8eca29546294e36))
* **components:** export event names in a constant ([#868](https://github.com/GenSpectrum/dashboard-components/issues/868)) ([f185a00](https://github.com/GenSpectrum/dashboard-components/commit/f185a005ca2aa8e52fdcade51947318a3396f428))

## [0.19.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.1...dashboard-components-v0.19.2) (2025-04-22)


### Features

* **components:** gs-text-input: make it possible to paste values and accept them on blur ([#852](https://github.com/GenSpectrum/dashboard-components/issues/852)) ([8532778](https://github.com/GenSpectrum/dashboard-components/commit/853277810310750c1c57d4dcc70489362af3213a)), closes [#812](https://github.com/GenSpectrum/dashboard-components/issues/812)

## [0.19.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.19.0...dashboard-components-v0.19.1) (2025-04-15)


### Bug Fixes

* **components:** fixes a bug that caused the `displayMutations` parameter of `gs-mutations-over-time` to not work for genes containing lowercase letters ([#861](https://github.com/GenSpectrum/dashboard-components/issues/861)) ([4c3b871](https://github.com/GenSpectrum/dashboard-components/commit/4c3b8714219ad4d450ac2a92e966dce950ed677a))

## [0.19.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.6...dashboard-components-v0.19.0) (2025-04-13)


### ⚠ BREAKING CHANGES

* **components:** Removed the `styles.css` export. It's not necessary anymore.

### Features

* **components:** render calendar inside shadow dom ([#849](https://github.com/GenSpectrum/dashboard-components/issues/849)) ([3769481](https://github.com/GenSpectrum/dashboard-components/commit/376948180e973918ee75e47de28ff89e7194c658)), closes [#806](https://github.com/GenSpectrum/dashboard-components/issues/806)


### Bug Fixes

* **components:** apply daisyui styles to host instead of root ([#850](https://github.com/GenSpectrum/dashboard-components/issues/850)) ([4b66975](https://github.com/GenSpectrum/dashboard-components/commit/4b66975e946f6ec9d3a225c4b824d3f13a36a749))
* **components:** apply Tailwind's `[@property](https://github.com/property)`s to the `:host` instead ([4b66975](https://github.com/GenSpectrum/dashboard-components/commit/4b66975e946f6ec9d3a225c4b824d3f13a36a749)), closes [#807](https://github.com/GenSpectrum/dashboard-components/issues/807) [#804](https://github.com/GenSpectrum/dashboard-components/issues/804)

## [0.18.6](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.5...dashboard-components-v0.18.6) (2025-04-03)


### Features

* **components:** gs-mutations-over-time search for mutations and annotations ([#843](https://github.com/GenSpectrum/dashboard-components/issues/843)) ([b5e24d8](https://github.com/GenSpectrum/dashboard-components/commit/b5e24d87f2c896dd0ef182a8d790d3c3f41a2616)), closes [#805](https://github.com/GenSpectrum/dashboard-components/issues/805)
* **components:** gs-wastewater-mutations-over-time: persist pagination page size across tabs ([#840](https://github.com/GenSpectrum/dashboard-components/issues/840)) ([b5a1a58](https://github.com/GenSpectrum/dashboard-components/commit/b5a1a5810f467c72c489b5138ca3fb841ab3877a)), closes [#835](https://github.com/GenSpectrum/dashboard-components/issues/835)
* **components:** validate mutations in gs-mutation-filter ([#826](https://github.com/GenSpectrum/dashboard-components/issues/826)) ([53bc289](https://github.com/GenSpectrum/dashboard-components/commit/53bc2896a3a48ed4dbe2106ddfdd6670030feb49)), closes [#792](https://github.com/GenSpectrum/dashboard-components/issues/792)


### Bug Fixes

* **components:** fix codePen of gs-mutations-over-time ([#845](https://github.com/GenSpectrum/dashboard-components/issues/845)) ([ff6c122](https://github.com/GenSpectrum/dashboard-components/commit/ff6c122c679e5890949c31ff93dbc4c1b0919e8c)), closes [#810](https://github.com/GenSpectrum/dashboard-components/issues/810)
* **examples:** fix commonjs import of leaflet for plain js ([#844](https://github.com/GenSpectrum/dashboard-components/issues/844)) ([c4b4666](https://github.com/GenSpectrum/dashboard-components/commit/c4b466666fc7b84b929ed0d50ac57afb748daed5))

## [0.18.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.4...dashboard-components-v0.18.5) (2025-03-31)


### Features

* **components:** improve design of pagination on smaller screens ([#836](https://github.com/GenSpectrum/dashboard-components/issues/836)) ([0673ba2](https://github.com/GenSpectrum/dashboard-components/commit/0673ba2ed6a534df2f5fb94e01b75ac2c8fede45)), closes [#794](https://github.com/GenSpectrum/dashboard-components/issues/794)
* **components:** rename segment selector for amino acids ([#839](https://github.com/GenSpectrum/dashboard-components/issues/839)) ([6ac3867](https://github.com/GenSpectrum/dashboard-components/commit/6ac38678aceb2c14ce15a08c607729685c4b53e5))


### Bug Fixes

* **components:** fix sequences by location test ([#831](https://github.com/GenSpectrum/dashboard-components/issues/831)) ([cc548ac](https://github.com/GenSpectrum/dashboard-components/commit/cc548ac5f691c2968a31f473dbe89bbc309d2a36)), closes [#797](https://github.com/GenSpectrum/dashboard-components/issues/797)
* **components:** prevent mutation cell layout shift ([#827](https://github.com/GenSpectrum/dashboard-components/issues/827)) ([944fca2](https://github.com/GenSpectrum/dashboard-components/commit/944fca23b551de6896f3c62aa8eef5ba5814e073)), closes [#809](https://github.com/GenSpectrum/dashboard-components/issues/809)

## [0.18.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.3...dashboard-components-v0.18.4) (2025-03-24)


### Bug Fixes

* **components:** pin `vite-plugin-dts` to 4.5.0 to export JSX.IntrinsicElements namespace declarations ([#828](https://github.com/GenSpectrum/dashboard-components/issues/828)) ([3b38707](https://github.com/GenSpectrum/dashboard-components/commit/3b387075821dec881a4b48f46722bc2ad5c39020))

## [0.18.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.2...dashboard-components-v0.18.3) (2025-03-21)


### Features

* **components:** add dropdown to select genes for WISE rsv ([#824](https://github.com/GenSpectrum/dashboard-components/issues/824)) ([511f270](https://github.com/GenSpectrum/dashboard-components/commit/511f2709171b9728bb8ba5cb3a513041fa120c90))
* **components:** allow annotations of positions ([#822](https://github.com/GenSpectrum/dashboard-components/issues/822)) ([368199f](https://github.com/GenSpectrum/dashboard-components/commit/368199fd4e482c0a3f3aaba9ed0ff7142d867081)), closes [#776](https://github.com/GenSpectrum/dashboard-components/issues/776)


### Bug Fixes

* **components:** disable outline when selecting regions in map in Chrome ([#729](https://github.com/GenSpectrum/dashboard-components/issues/729)) ([a11f778](https://github.com/GenSpectrum/dashboard-components/commit/a11f778159d8cf88b8f056a6c382a2434dc8b4ee))

## [0.18.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.1...dashboard-components-v0.18.2) (2025-03-17)


### Bug Fixes

* **components:** gs-date-range-filter make it explicit that the event contains `null` when deleting the input ([#816](https://github.com/GenSpectrum/dashboard-components/issues/816)) ([acd25da](https://github.com/GenSpectrum/dashboard-components/commit/acd25da2e0baa2b0e6a6b40b7cb180cbb03c894f))

## [0.18.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.18.0...dashboard-components-v0.18.1) (2025-03-17)


### Features

* **components:** mutations over time: don't show wrong "0" count when mutation cell doesn't have data ([#813](https://github.com/GenSpectrum/dashboard-components/issues/813)) ([2224eea](https://github.com/GenSpectrum/dashboard-components/commit/2224eea567a7fda55b529fec827e373445622696)), closes [#795](https://github.com/GenSpectrum/dashboard-components/issues/795)


### Bug Fixes

* **components:** gs-mutation-filter: indicate that one can click the x button that deletes selected mutations ([#803](https://github.com/GenSpectrum/dashboard-components/issues/803)) ([461f602](https://github.com/GenSpectrum/dashboard-components/commit/461f602f727265dafea572861876a2e03a0f19b3))

## [0.18.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.17.1...dashboard-components-v0.18.0) (2025-03-10)


### ⚠ BREAKING CHANGES

* **components:** Upgrade to tailwind 4

### Miscellaneous Chores

* **components:** upgrade to tailwind 4 and daisyui 5 ([#793](https://github.com/GenSpectrum/dashboard-components/issues/793)) ([1a22dca](https://github.com/GenSpectrum/dashboard-components/commit/1a22dca36a54552abd383cb89ec110a545d5c506))

## [0.17.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.17.0...dashboard-components-v0.17.1) (2025-03-05)


### Features

* **components:** add pagination for gs-mutations-over-time and gs-wastewater-mutations-over-time ([#787](https://github.com/GenSpectrum/dashboard-components/issues/787)) ([078608e](https://github.com/GenSpectrum/dashboard-components/commit/078608e414b248ac4552400ca8ea724a05c7a852)), closes [#694](https://github.com/GenSpectrum/dashboard-components/issues/694)

## [0.17.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.16.4...dashboard-components-v0.17.0) (2025-03-03)


### ⚠ BREAKING CHANGES

* **components:** Rename DateRangeSelectOption to DateRangeValue

### Features

* **components:** gs-date-range-selector:  allow for undefined ([#741](https://github.com/GenSpectrum/dashboard-components/issues/741)) ([71d118c](https://github.com/GenSpectrum/dashboard-components/commit/71d118c7c3b3593fb59c967b52069dbd7a391f68)), closes [#719](https://github.com/GenSpectrum/dashboard-components/issues/719)

## [0.16.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.16.3...dashboard-components-v0.16.4) (2025-02-27)


### Features

* **components:** add mutation annotations to 'gs-mutation-comparison' ([#777](https://github.com/GenSpectrum/dashboard-components/issues/777)) ([49eb036](https://github.com/GenSpectrum/dashboard-components/commit/49eb0364b2cbf8b7175745f3f204bb69acf414f2)), closes [#772](https://github.com/GenSpectrum/dashboard-components/issues/772)
* **components:** allow HTML in mutation annotation description ([#780](https://github.com/GenSpectrum/dashboard-components/issues/780)) ([cdb0a0a](https://github.com/GenSpectrum/dashboard-components/commit/cdb0a0a95b9fcf699690ea83db22b283bba226e6)), closes [#762](https://github.com/GenSpectrum/dashboard-components/issues/762)
* **components:** export mutation annotations types ([#782](https://github.com/GenSpectrum/dashboard-components/issues/782)) ([06a487e](https://github.com/GenSpectrum/dashboard-components/commit/06a487ec144253133ab1b768626278b4e6234c11))


### Bug Fixes

* **components:** make it possible to copy an annotated mutation in Firefox ([#779](https://github.com/GenSpectrum/dashboard-components/issues/779)) ([ab4add0](https://github.com/GenSpectrum/dashboard-components/commit/ab4add0779f3476564dbb4d875d3ad3aafd5e517)), closes [#778](https://github.com/GenSpectrum/dashboard-components/issues/778)

## [0.16.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.16.2...dashboard-components-v0.16.3) (2025-02-24)


### Features

* **components:** add mutation annotations to `gs-mutations-over-time` ([#755](https://github.com/GenSpectrum/dashboard-components/issues/755)) ([57ee029](https://github.com/GenSpectrum/dashboard-components/commit/57ee02928ae1ab001456767e12c35dd409dca40e)), closes [#753](https://github.com/GenSpectrum/dashboard-components/issues/753)
* **components:** add mutation annotations to `gs-mutations` ([#768](https://github.com/GenSpectrum/dashboard-components/issues/768)) ([6bbbe8c](https://github.com/GenSpectrum/dashboard-components/commit/6bbbe8c52e6cd0b4675cf9e6c9e05fb0ce75cc0b)), closes [#766](https://github.com/GenSpectrum/dashboard-components/issues/766)
* **components:** gs-mutations-over-time: add the count of samples with coverage to grid cell tooltip ([#758](https://github.com/GenSpectrum/dashboard-components/issues/758)) ([281a55a](https://github.com/GenSpectrum/dashboard-components/commit/281a55a800275e81836f9ca35fc232c6d0cf338e)), closes [#744](https://github.com/GenSpectrum/dashboard-components/issues/744)

## [0.16.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.16.1...dashboard-components-v0.16.2) (2025-02-17)


### Bug Fixes

* **components:** gs-wastewater-mutations-over-times: update when props change ([#754](https://github.com/GenSpectrum/dashboard-components/issues/754)) ([e2c4662](https://github.com/GenSpectrum/dashboard-components/commit/e2c4662e70062c8f296d2f90f2517f685df1b951))
* **components:** make sure to render the downshift combobox with the correct items ([#757](https://github.com/GenSpectrum/dashboard-components/issues/757)) ([41bfc0b](https://github.com/GenSpectrum/dashboard-components/commit/41bfc0b70d80e6743855cf5fecc0993656377d4f))

## [0.16.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.16.0...dashboard-components-v0.16.1) (2025-02-12)


### Features

* **components:** gs-mutations-over-time: add `displayMutations` attribute to filter the displayed mutations ([#747](https://github.com/GenSpectrum/dashboard-components/issues/747)) ([c6a144f](https://github.com/GenSpectrum/dashboard-components/commit/c6a144f2a685c7bd794ce7188b7a39b68fb9c90b)), closes [#733](https://github.com/GenSpectrum/dashboard-components/issues/733)
* **components:** gs-mutations-over-time: add `initialMeanProportionInterval` attribute ([#750](https://github.com/GenSpectrum/dashboard-components/issues/750)) ([d40a990](https://github.com/GenSpectrum/dashboard-components/commit/d40a990793c47fc84dc7835c43cfdd7dfb424a01)), closes [#734](https://github.com/GenSpectrum/dashboard-components/issues/734)


### Bug Fixes

* **components:** gs-mutations-over-time: hide x-axis labels when there is no data to be displayed ([#749](https://github.com/GenSpectrum/dashboard-components/issues/749)) ([926aec3](https://github.com/GenSpectrum/dashboard-components/commit/926aec3f780ff3bc3a33e308c419dbc8f59858c8)), closes [#748](https://github.com/GenSpectrum/dashboard-components/issues/748)
* **components:** initialize the reference genomes context with a value that is recognized as "uninitialized" ([#751](https://github.com/GenSpectrum/dashboard-components/issues/751)) ([8735088](https://github.com/GenSpectrum/dashboard-components/commit/873508825915216dabac8b74d306ec5130d94270))
* **components:** omit attributes that are undefined in code examples ([#739](https://github.com/GenSpectrum/dashboard-components/issues/739)) ([11e2571](https://github.com/GenSpectrum/dashboard-components/commit/11e2571c8c9187b212b5c228c71bb864f016e33b))

## [0.16.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.15.0...dashboard-components-v0.16.0) (2025-02-12)


### ⚠ BREAKING CHANGES

* **components:** If height is not set, use automatic determined height by content instead of default value.

### Features

* **components:** gs-mutation-filter: show error when the reference genomes are empty ([#743](https://github.com/GenSpectrum/dashboard-components/issues/743)) ([892196a](https://github.com/GenSpectrum/dashboard-components/commit/892196a55390177c87689a17f6d77b7128f3672f)), closes [#704](https://github.com/GenSpectrum/dashboard-components/issues/704)
* **components:** visualization components: determine height automatically by content height ([e058cb4](https://github.com/GenSpectrum/dashboard-components/commit/e058cb4bd85e05648155547fa6b8bc771dbca5a9)), closes [#381](https://github.com/GenSpectrum/dashboard-components/issues/381)


### Bug Fixes

* **components:** gs-sequences-by-location: don't crash table view when there is no data ([#731](https://github.com/GenSpectrum/dashboard-components/issues/731)) ([3ff3ab9](https://github.com/GenSpectrum/dashboard-components/commit/3ff3ab96d0d7abcbb94cfc9de126a075b9ac540c))

## [0.15.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.14.2...dashboard-components-v0.15.0) (2025-02-10)


### ⚠ BREAKING CHANGES

* **components:** rename gs-text-input to gs-text-filter ([#709](https://github.com/GenSpectrum/dashboard-components/issues/709))
* **components:** rename gs-date-range-selector to gs-date-range-filter ([#709](https://github.com/GenSpectrum/dashboard-components/issues/709))

### Bug Fixes

* **components:** gs-date-range-selector `value`: make sure that strings are recognized as strings ([#727](https://github.com/GenSpectrum/dashboard-components/issues/727)) ([016f99d](https://github.com/GenSpectrum/dashboard-components/commit/016f99db275105d561b3a3c078dac02e8d2afc9f))


### Code Refactoring

* **components:** rename gs-date-range-selector to gs-date-range-filter ([#709](https://github.com/GenSpectrum/dashboard-components/issues/709)) ([a04c13d](https://github.com/GenSpectrum/dashboard-components/commit/a04c13d7f8cfa2de062b611a08951759cc779f81))
* **components:** rename gs-text-input to gs-text-filter ([#709](https://github.com/GenSpectrum/dashboard-components/issues/709)) ([4870f5b](https://github.com/GenSpectrum/dashboard-components/commit/4870f5b7cd449adc5fb368ed85b9744a53150527))

## [0.14.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.14.1...dashboard-components-v0.14.2) (2025-02-10)


### Bug Fixes

* **components:** reset error when the component props have changed ([#726](https://github.com/GenSpectrum/dashboard-components/issues/726)) ([b0b3429](https://github.com/GenSpectrum/dashboard-components/commit/b0b34291e844ec10a07a8d962a25c16accc68ac8))

## [0.14.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.14.0...dashboard-components-v0.14.1) (2025-02-05)


### Bug Fixes

* **components:** gs-mutation-filter: fix info wrongly showing "no nucleotide sequences" when there is only one ([#720](https://github.com/GenSpectrum/dashboard-components/issues/720)) ([10c79cb](https://github.com/GenSpectrum/dashboard-components/commit/10c79cb9d4907a3b585364f7739e922d4828e613))

## [0.14.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.7...dashboard-components-v0.14.0) (2025-02-04)


### ⚠ BREAKING CHANGES

* **components:** gs-date-range-selector: remove `initialValue`, `initialDateFrom`, `initialDateTo`. Use `value` instead.

### Features

* **components:** gs-date-range-selector: make the component controllable from a surrounding JS app ([#710](https://github.com/GenSpectrum/dashboard-components/issues/710)) ([250587e](https://github.com/GenSpectrum/dashboard-components/commit/250587ea37bcf3967c6ccfc1b70e41dd4b86a556)), closes [#683](https://github.com/GenSpectrum/dashboard-components/issues/683)


### Bug Fixes

* **components:** trim trailing slash off the `lapis` url that is provided to `gs-app` ([#711](https://github.com/GenSpectrum/dashboard-components/issues/711)) ([091d792](https://github.com/GenSpectrum/dashboard-components/commit/091d792e7adfa45a99d004a69dd4e319a9a530a1)), closes [#703](https://github.com/GenSpectrum/dashboard-components/issues/703)

## [0.13.7](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.6...dashboard-components-v0.13.7) (2025-01-31)


### Features

* **components:** gs-mutations-over-time: add x-axis tick labels to grid ([#708](https://github.com/GenSpectrum/dashboard-components/issues/708)) ([686d9d3](https://github.com/GenSpectrum/dashboard-components/commit/686d9d3970fa962f14485b8d6fe16a33ee5d35c2)), closes [#681](https://github.com/GenSpectrum/dashboard-components/issues/681)
* **components:** make component tabs layout better suited for multiline layout ([#706](https://github.com/GenSpectrum/dashboard-components/issues/706)) ([0a22115](https://github.com/GenSpectrum/dashboard-components/commit/0a22115b963b90f9d3dec6348df4b4b78d77ab57)), closes [#675](https://github.com/GenSpectrum/dashboard-components/issues/675)


### Bug Fixes

* **components:** gs-mutation-filter: allow for reference genome with no genes ([af26d8b](https://github.com/GenSpectrum/dashboard-components/commit/af26d8b70d16f55aa286a750d5df99ff1aff3ea4))

## [0.13.6](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.5...dashboard-components-v0.13.6) (2025-01-27)


### Features

* **components:** gs-location-filter: show counts in autocomplete options ([#685](https://github.com/GenSpectrum/dashboard-components/issues/685)) ([260a33b](https://github.com/GenSpectrum/dashboard-components/commit/260a33b5b40180dff97ecf6d95fe319a9f10df4f)), closes [#665](https://github.com/GenSpectrum/dashboard-components/issues/665)
* **components:** gs-mutation-comparison: add info text ([#684](https://github.com/GenSpectrum/dashboard-components/issues/684)) ([f19cb9e](https://github.com/GenSpectrum/dashboard-components/commit/f19cb9e092faded8964147112c8e3ca4aaa1d133)), closes [#465](https://github.com/GenSpectrum/dashboard-components/issues/465)


### Bug Fixes

* **components:** gs-wastewater-mutations-over-time: throw proper error when there is an invalid mutation ([#687](https://github.com/GenSpectrum/dashboard-components/issues/687)) ([3b98625](https://github.com/GenSpectrum/dashboard-components/commit/3b98625c24911eec29224db4071966464e23b8fb))

## [0.13.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.4...dashboard-components-v0.13.5) (2025-01-24)


### Features

* **components:** let maxNumberOfGridRows be configurable for wastewater-mutations-over-time ([#692](https://github.com/GenSpectrum/dashboard-components/issues/692)) ([768dc3a](https://github.com/GenSpectrum/dashboard-components/commit/768dc3afd1e4236d4a8f5cf505c357c8f6928a35))

## [0.13.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.3...dashboard-components-v0.13.4) (2025-01-24)


### Features

* **components:** gs-wastewater-mutations-over-time - add infoText slot in info box ([#686](https://github.com/GenSpectrum/dashboard-components/issues/686)) ([cb8aafa](https://github.com/GenSpectrum/dashboard-components/commit/cb8aafaf622460e64587091e403881c3534ec046))

## [0.13.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.2...dashboard-components-v0.13.3) (2025-01-23)


### Features

* **components:** allow mutations to end in * ([#688](https://github.com/GenSpectrum/dashboard-components/issues/688)) ([30078e3](https://github.com/GenSpectrum/dashboard-components/commit/30078e30f85364a8a47bcb252dca500f4f0abd9b))

## [0.13.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.1...dashboard-components-v0.13.2) (2025-01-21)


### Features

* **components:** gs-text-input: show count on autocomplete options ([b14cb8c](https://github.com/GenSpectrum/dashboard-components/commit/b14cb8c43212e5d97ba4684787638375b93ed0c0)), closes [#664](https://github.com/GenSpectrum/dashboard-components/issues/664)


### Bug Fixes

* **components:** remove console error from downshift: getMenuProps not called ([b8fb7a3](https://github.com/GenSpectrum/dashboard-components/commit/b8fb7a3e82c9448e19a965128505b31f9ce41134))

## [0.13.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.13.0...dashboard-components-v0.13.1) (2025-01-21)


### Features

* **components:** add mutations over time plot for wastewater / WISE ([#668](https://github.com/GenSpectrum/dashboard-components/issues/668)) ([#504](https://github.com/GenSpectrum/dashboard-components/issues/504)) ([c4359eb](https://github.com/GenSpectrum/dashboard-components/commit/c4359eb36a2237f7c3562e01d202403b677dbad8))

## [0.13.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.12.1...dashboard-components-v0.13.0) (2025-01-21)


### ⚠ BREAKING CHANGES

* **components:** Rename initialValue to value for gs-lineage-filter
* **components:** Rename initialValue to value for text input

### Features

* **components:** add lapis filter to lineage filter ([4a7df02](https://github.com/GenSpectrum/dashboard-components/commit/4a7df029f207faabefbd04c76bd5efd9602f3b0d)), closes [#609](https://github.com/GenSpectrum/dashboard-components/issues/609)
* **components:** add lapis filter to location filter ([a42abb9](https://github.com/GenSpectrum/dashboard-components/commit/a42abb9fd61e822e35545030dba4f980841ca01d)), closes [#609](https://github.com/GenSpectrum/dashboard-components/issues/609)
* **components:** add lapis filter to text input ([199d2fe](https://github.com/GenSpectrum/dashboard-components/commit/199d2fe8414206dfc6c20cc72c037a78f3c3f4b9)), closes [#609](https://github.com/GenSpectrum/dashboard-components/issues/609)
* **components:** gs-lineage-filter: rename initialValue to value ([1ff38e4](https://github.com/GenSpectrum/dashboard-components/commit/1ff38e4fc39939e5f6761f93ddd5b487146adddd))
* **components:** gs-lineage-filter: use downshift for selector ([e66d526](https://github.com/GenSpectrum/dashboard-components/commit/e66d526f04147f5608d92825bbdc2dffb2c967ca)), closes [#654](https://github.com/GenSpectrum/dashboard-components/issues/654)
* **components:** let users know that they can not select anything in filter ([3c32543](https://github.com/GenSpectrum/dashboard-components/commit/3c32543f9bd5bb9de5d9c339052f08f97ed41498))


### Bug Fixes

* **components:** add lapisFilter as dependency so that filter is reloaded upon change ([bc08949](https://github.com/GenSpectrum/dashboard-components/commit/bc089490b7aace384cf1a22705232a2390574745))


### Code Refactoring

* **components:** extract downshift combobox from location filter and text input ([dfe105e](https://github.com/GenSpectrum/dashboard-components/commit/dfe105e1de2530aeb7667e2fa893ad380454bbf4)), closes [#660](https://github.com/GenSpectrum/dashboard-components/issues/660)

## [0.12.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.12.0...dashboard-components-v0.12.1) (2025-01-17)


### Features

* **components:** sort options of textput filter ([#657](https://github.com/GenSpectrum/dashboard-components/issues/657)) ([e675040](https://github.com/GenSpectrum/dashboard-components/commit/e67504075d4ba3d8338574b23f480c158c482cdc))
* **components:** use downshift for textinput filter ([#659](https://github.com/GenSpectrum/dashboard-components/issues/659)) ([95e33a6](https://github.com/GenSpectrum/dashboard-components/commit/95e33a689f5a2eecbd2449c6114a54a6c0ada933))


### Bug Fixes

* **components:** don't use Leaflet default export ([#656](https://github.com/GenSpectrum/dashboard-components/issues/656)) ([648c9fb](https://github.com/GenSpectrum/dashboard-components/commit/648c9fb2b68909444bf5996e562d531722f6e217))

## [0.12.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.7...dashboard-components-v0.12.0) (2025-01-14)


### ⚠ BREAKING CHANGES

* **components:** gs-location-filter prop initialValue changed to value, a json with the event value

### Features

* **components:** gs-mutation-filter: add quickstart guide to info text ([#646](https://github.com/GenSpectrum/dashboard-components/issues/646)) ([5390aa7](https://github.com/GenSpectrum/dashboard-components/commit/5390aa7143f9c098219f3398bdbd8392765ec9ae)), closes [#637](https://github.com/GenSpectrum/dashboard-components/issues/637)
* **components:** improve design of location filter ([18fc805](https://github.com/GenSpectrum/dashboard-components/commit/18fc80571d668ccc5b9f763949bdcb07fc5db533)), closes [#267](https://github.com/GenSpectrum/dashboard-components/issues/267)


### Bug Fixes

* **components:** add trailing newline to all downloaded CSVs ([#647](https://github.com/GenSpectrum/dashboard-components/issues/647)) ([342de23](https://github.com/GenSpectrum/dashboard-components/commit/342de23544fe651f3d35de0dc46445ffb2cb7354))

## [0.11.7](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.6...dashboard-components-v0.11.7) (2025-01-13)


### Features

* **components:** gs-mutations: compute Jaccard similarity ([#640](https://github.com/GenSpectrum/dashboard-components/issues/640)) ([a3a5869](https://github.com/GenSpectrum/dashboard-components/commit/a3a58691e7d725690ba7fef0ed5fb1288e1cf0b7)), closes [#608](https://github.com/GenSpectrum/dashboard-components/issues/608)


### Bug Fixes

* **components:** gs-mutations-over-time: show 0 instead of "no data" when there are sequences but no mutation ([#635](https://github.com/GenSpectrum/dashboard-components/issues/635) case 2) ([#644](https://github.com/GenSpectrum/dashboard-components/issues/644)) ([6067e3c](https://github.com/GenSpectrum/dashboard-components/commit/6067e3cc8fcf7154c575228c6e200488b0c08e7f))

## [0.11.6](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.5...dashboard-components-v0.11.6) (2025-01-13)


### Features

* **components:** gs-aggregate: add bar chart view ([#639](https://github.com/GenSpectrum/dashboard-components/issues/639)) ([6d834ce](https://github.com/GenSpectrum/dashboard-components/commit/6d834ce4f336099fbf51ae0caaa1ad0cf605bf51))


### Bug Fixes

* **components:** show mutation over time tooltip below value on first six rows ([89dc0f3](https://github.com/GenSpectrum/dashboard-components/commit/89dc0f3e3cffea40f7d8a6a1ba62095eae6f483e)), closes [#634](https://github.com/GenSpectrum/dashboard-components/issues/634)

## [0.11.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.4...dashboard-components-v0.11.5) (2025-01-09)


### Bug Fixes

* **components:** fix `lastDay` of `YearWeekClass` ([#635](https://github.com/GenSpectrum/dashboard-components/issues/635) case 1) ([#641](https://github.com/GenSpectrum/dashboard-components/issues/641)) ([e56c5a9](https://github.com/GenSpectrum/dashboard-components/commit/e56c5a933f612f38d542512183a6f60d184362ac))

## [0.11.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.3...dashboard-components-v0.11.4) (2025-01-07)


### Features

* **components:** gs-sequences-by-location table view: say whether a location is shown on the map ([#623](https://github.com/GenSpectrum/dashboard-components/issues/623)) ([0cdde85](https://github.com/GenSpectrum/dashboard-components/commit/0cdde8580e64340b63ab10117ef9758111b87c41)), closes [#617](https://github.com/GenSpectrum/dashboard-components/issues/617)
* **components:** gs-sequences-by-location: add button to download the data ([#625](https://github.com/GenSpectrum/dashboard-components/issues/625)) ([865f0a2](https://github.com/GenSpectrum/dashboard-components/commit/865f0a2096370dbc0ffd748b5e300b773451db67)), closes [#624](https://github.com/GenSpectrum/dashboard-components/issues/624)


### Bug Fixes

* **components:** gs-aggregate: rerender when `initialSortField` or `initialSortDirection` changes ([60d578f](https://github.com/GenSpectrum/dashboard-components/commit/60d578fe903091ad674aad4126bc1ea839543bf8))

## [0.11.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.2...dashboard-components-v0.11.3) (2024-12-19)


### Bug Fixes

* **components:** gs-sequences-by-location map view: more distinct colors of location borders and locations without data ([#620](https://github.com/GenSpectrum/dashboard-components/issues/620)) ([5aa4802](https://github.com/GenSpectrum/dashboard-components/commit/5aa4802551d305e4069fd3eeb3e60d1d7d5d14d8))

## [0.11.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.1...dashboard-components-v0.11.2) (2024-12-18)


### Features

* **components:** gs-sequences-by-location: show how many sequences were matched on locations in map view ([#616](https://github.com/GenSpectrum/dashboard-components/issues/616)) ([2eb42ad](https://github.com/GenSpectrum/dashboard-components/commit/2eb42ad08e5be10c31a89c326ef2eb3c72b942e8)), closes [#614](https://github.com/GenSpectrum/dashboard-components/issues/614)


### Bug Fixes

* **components:** set default of `enableMapNavigation` to false ([#610](https://github.com/GenSpectrum/dashboard-components/issues/610)) ([bb7bae4](https://github.com/GenSpectrum/dashboard-components/commit/bb7bae44c0e9b43a8ba0ef45f7c927457f323a9a))

## [0.11.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.11.0...dashboard-components-v0.11.1) (2024-12-13)


### Features

* **components:** export type `MapSource` ([#606](https://github.com/GenSpectrum/dashboard-components/issues/606)) ([94c12d1](https://github.com/GenSpectrum/dashboard-components/commit/94c12d167734f0c28985b7332228d1e5e95fd035))

## [0.11.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.10.4...dashboard-components-v0.11.0) (2024-12-12)


### ⚠ BREAKING CHANGES

* **components:** gs-number-sequences-over-time: rename `lapisFilter` attribute to `lapisFilters`, `lapisFilters` must be an array (a single object is no longer allowed)
* **components:** gs-date-range-selector: rename attribute `dateColumn` to `lapisDateField`
* **components:** gs-prevalence-over-time: rename `numeratorFilter` to `numeratorFilters`, `numeratorFilters` must be an array (a single object is no longer allowed)
* **components:** gs-aggregate: rename attribute `filter` to `lapisFilter`
* **components:** rename type `SelectedMutationFilterStrings` to `MutationsFilter`

### Features

* **components:** export prop types of visualization components ([92e3796](https://github.com/GenSpectrum/dashboard-components/commit/92e3796c98d0536d6081b8bb53c84ba21da366ac))


### Bug Fixes

* **components:** allow arrays in LapisFilter ([4751ce8](https://github.com/GenSpectrum/dashboard-components/commit/4751ce89527a2f801a6bdb0114fb062c6231f117))
* **components:** gs-aggregate: rename attribute `filter` to `lapisFilter` ([6c70244](https://github.com/GenSpectrum/dashboard-components/commit/6c70244fc231e8783f13cf058e206bc5c42d0a11))
* **components:** gs-date-range-selector: consistently name `lapisDateField` ([21c5e43](https://github.com/GenSpectrum/dashboard-components/commit/21c5e43a65261a44cc1b42abee2d9fcb52487ed3))
* **components:** gs-number-sequences-over-time: rename `lapisFilter` attribute to `lapisFilters` ([fc35557](https://github.com/GenSpectrum/dashboard-components/commit/fc355575b925acdba02dc532be9b65e1a23fd5f5))
* **components:** gs-prevalence-over-time, gs-number-sequences-over-time: require at least one lapis filter ([b3267d6](https://github.com/GenSpectrum/dashboard-components/commit/b3267d60a53b29c690b75f0a9f48c36e2359da65))
* **components:** gs-prevalence-over-time: rename `numeratorFilter` attribute ([61d0c78](https://github.com/GenSpectrum/dashboard-components/commit/61d0c782346b31f4ff143ac6e91e294b72d93265))
* **components:** gs-relative-growth-advantage: fix code example in info box ([d6ddbb2](https://github.com/GenSpectrum/dashboard-components/commit/d6ddbb28563cc3a7a96445d0e179eca84cdb5dea))

## [0.10.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.10.3...dashboard-components-v0.10.4) (2024-12-11)


### Features

* **components:** add `gs-sequences-by-location` with a map view ([#553](https://github.com/GenSpectrum/dashboard-components/issues/553)) ([b3734f9](https://github.com/GenSpectrum/dashboard-components/commit/b3734f932f3c5383587254b954de8c072153a3cb)), closes [#548](https://github.com/GenSpectrum/dashboard-components/issues/548)
* **components:** gs-sequences-by-location: add table view ([#602](https://github.com/GenSpectrum/dashboard-components/issues/602)) ([c04b7ba](https://github.com/GenSpectrum/dashboard-components/commit/c04b7baf77c4c8119deb22a5724c10202b2d3478)), closes [#597](https://github.com/GenSpectrum/dashboard-components/issues/597)

## [0.10.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.10.2...dashboard-components-v0.10.3) (2024-12-10)


### Bug Fixes

* **components:** better explanation of "invalid attributes" error ([#595](https://github.com/GenSpectrum/dashboard-components/issues/595)) ([57e1f0a](https://github.com/GenSpectrum/dashboard-components/commit/57e1f0a8ab393460e70c83d2a90cabfa16cdcf0e))
* **components:** don't crash components when someone passes empty `views` attribute ([#594](https://github.com/GenSpectrum/dashboard-components/issues/594)) ([24ffc86](https://github.com/GenSpectrum/dashboard-components/commit/24ffc863f0267124c89af1731f4948deda82cb79))
* **components:** gs-aggregate: validate attributes ([84fc7ff](https://github.com/GenSpectrum/dashboard-components/commit/84fc7ff6c742f505dc8136ade5d1caae7739f28b)), closes [#572](https://github.com/GenSpectrum/dashboard-components/issues/572)
* **components:** gs-app: validate attributes ([4231ea7](https://github.com/GenSpectrum/dashboard-components/commit/4231ea760d13e73dd6e6f0729d716ba30a2ccdf8)), closes [#579](https://github.com/GenSpectrum/dashboard-components/issues/579)
* **components:** gs-mutation-filter: validate attributes ([f2b8fbc](https://github.com/GenSpectrum/dashboard-components/commit/f2b8fbc64afd7442bdf2f3be49ae17eaee01398b)), closes [#570](https://github.com/GenSpectrum/dashboard-components/issues/570)
* **components:** gs-mutations-over-time: validate attributes ([7d8798d](https://github.com/GenSpectrum/dashboard-components/commit/7d8798d89efde6ae861fa40b170cfcae43f81fc8)), closes [#574](https://github.com/GenSpectrum/dashboard-components/issues/574)
* **components:** gs-mutations: validate attributes ([218f7bb](https://github.com/GenSpectrum/dashboard-components/commit/218f7bb12ecf15688e18517752ec3a25395db545)), closes [#573](https://github.com/GenSpectrum/dashboard-components/issues/573)
* **components:** gs-number-sequences-over-time: validate attributes ([577ef87](https://github.com/GenSpectrum/dashboard-components/commit/577ef8744a6be2a10bb30910ce68816a11d26000)), closes [#575](https://github.com/GenSpectrum/dashboard-components/issues/575)
* **components:** gs-prevalence-over-time: validate attributes ([aa9a3bb](https://github.com/GenSpectrum/dashboard-components/commit/aa9a3bb6555a1279409365678d3146d5eebdc735)), closes [#576](https://github.com/GenSpectrum/dashboard-components/issues/576)
* **components:** gs-relative-growth-advantage: validate attributes ([182d4e4](https://github.com/GenSpectrum/dashboard-components/commit/182d4e4a790077abe72225b9c7272a3c8774c2c7)), closes [#577](https://github.com/GenSpectrum/dashboard-components/issues/577)
* **components:** gs-statistics: validate attributes ([66d75fe](https://github.com/GenSpectrum/dashboard-components/commit/66d75fe155d324e6b59a2335772360fdeeefde88)), closes [#578](https://github.com/GenSpectrum/dashboard-components/issues/578)
* **components:** gs-text-input: validate attributes ([823f798](https://github.com/GenSpectrum/dashboard-components/commit/823f7981d2143048ef9cc68d88a50221c929358a)), closes [#571](https://github.com/GenSpectrum/dashboard-components/issues/571)

## [0.10.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.10.1...dashboard-components-v0.10.2) (2024-12-09)


### Features

* **components:** gs-mutations-over-time: show empty grey box when we don't have mutation data for time interval ([9026098](https://github.com/GenSpectrum/dashboard-components/commit/90260989294a41d643ebbe4204aad2d3fd72e949)), closes [#565](https://github.com/GenSpectrum/dashboard-components/issues/565)


### Bug Fixes

* **components:** fix gs-aggregate name in `HTMLElementTagNameMap` and `IntrinsicElements` ([#566](https://github.com/GenSpectrum/dashboard-components/issues/566)) ([8cc1ced](https://github.com/GenSpectrum/dashboard-components/commit/8cc1ced82c70bc3936f30a69136f4d45aa4901a0))
* **components:** gs-date-range-selector: require that `dateColumn` is set ([beb040e](https://github.com/GenSpectrum/dashboard-components/commit/beb040ec8f4d7cf93bf03004daba433ceefd5612))
* **components:** gs-date-range-selector: validate component attributes ([#558](https://github.com/GenSpectrum/dashboard-components/issues/558)) ([114f907](https://github.com/GenSpectrum/dashboard-components/commit/114f90750c1cddc2675963f05a5f9efeaa709eee)), closes [#557](https://github.com/GenSpectrum/dashboard-components/issues/557)
* **components:** gs-lineage-filter: validate attributes ([e8aa1a9](https://github.com/GenSpectrum/dashboard-components/commit/e8aa1a9eba0889a6a28d56edee05cb76ca97223e)), closes [#561](https://github.com/GenSpectrum/dashboard-components/issues/561)
* **components:** gs-location-filter: validate attributes ([7272e6e](https://github.com/GenSpectrum/dashboard-components/commit/7272e6e41536c1928cf5fd91ec367d794b2e003c)), closes [#568](https://github.com/GenSpectrum/dashboard-components/issues/568)
* **components:** gs-mutation-comparison: validate attributes ([#564](https://github.com/GenSpectrum/dashboard-components/issues/564)) ([aa6a4c8](https://github.com/GenSpectrum/dashboard-components/commit/aa6a4c81a72f4faf9e62cd4825fce0925e80ca25)), closes [#563](https://github.com/GenSpectrum/dashboard-components/issues/563)

## [0.10.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.10.0...dashboard-components-v0.10.1) (2024-11-28)


### Features

* **components:** add statistics component ([bd231e0](https://github.com/GenSpectrum/dashboard-components/commit/bd231e01613dfe4edde212d3f22e0d19be7d87ea)), closes [#549](https://github.com/GenSpectrum/dashboard-components/issues/549)

## [0.10.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.9.1...dashboard-components-v0.10.0) (2024-11-25)


### ⚠ BREAKING CHANGES

* **components:** pass `['wilson', 'none']` instead of `['wilson']` to `confidenceIntervalMethods` of `gs-prevalence-over-time` to achieve the same behavior as before

### Features

* **components:** gs-prevalence-over-time: don't show confidence interval by default, explicitly require 'none' as `confidenceIntervalMethods` to show it ([#542](https://github.com/GenSpectrum/dashboard-components/issues/542)) ([b68dfb3](https://github.com/GenSpectrum/dashboard-components/commit/b68dfb3bb3c726c336b9938781cda61eedd29a85)), closes [#537](https://github.com/GenSpectrum/dashboard-components/issues/537)


### Bug Fixes

* **components:** gs-mutation-filter: make input fully case-insensitive ([#541](https://github.com/GenSpectrum/dashboard-components/issues/541)) ([08d0be3](https://github.com/GenSpectrum/dashboard-components/commit/08d0be3e43508a0b04c68db721dd3772930994b0)), closes [#536](https://github.com/GenSpectrum/dashboard-components/issues/536)

## [0.9.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.9.0...dashboard-components-v0.9.1) (2024-11-25)


### Features

* **components:** gs-relative-growth-advantage: show better errors when fit fails ([#535](https://github.com/GenSpectrum/dashboard-components/issues/535)) ([5b28eb1](https://github.com/GenSpectrum/dashboard-components/commit/5b28eb1a09e7768c1ead516bbbd59e8718080ae1)), closes [#506](https://github.com/GenSpectrum/dashboard-components/issues/506)


### Bug Fixes

* **components:** hide proportion on width of mutation over time cell ([#539](https://github.com/GenSpectrum/dashboard-components/issues/539)) ([998d8cf](https://github.com/GenSpectrum/dashboard-components/commit/998d8cf9ae56494379ad4be916f06bb92d8fceae)), closes [#538](https://github.com/GenSpectrum/dashboard-components/issues/538)

## [0.9.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.8.5...dashboard-components-v0.9.0) (2024-11-21)


### ⚠ BREAKING CHANGES

* **components:** Change name of event 'gs-date-range-changed' to 'gs-date-range-filter-changed'
* **components:** The web components must now be imported from `/components`. `DateRangeOption` and `dateRangeOptionPresets` must be imported from `/util`

### Features

* **components:** add last year date range preset ([#530](https://github.com/GenSpectrum/dashboard-components/issues/530)) ([cccde1f](https://github.com/GenSpectrum/dashboard-components/commit/cccde1fe9540f737abeeb1485927875cdc168ab0))
* **components:** add utils entrypoint for usage on node environment ([3c45773](https://github.com/GenSpectrum/dashboard-components/commit/3c457736bb9afbef9e8f0b042aad2c3ebc3b6ebf))
* **components:** fire additional event for date range option change ([8334ddf](https://github.com/GenSpectrum/dashboard-components/commit/8334ddf2a6a8cb4130892087a2168f204efd7f72)), closes [#526](https://github.com/GenSpectrum/dashboard-components/issues/526)

## [0.8.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.8.4...dashboard-components-v0.8.5) (2024-11-19)


### Bug Fixes

* **components:** propagate UserFacingErrors through the web worker ([#528](https://github.com/GenSpectrum/dashboard-components/issues/528)) ([97bd6ad](https://github.com/GenSpectrum/dashboard-components/commit/97bd6ad4d24e5330b40c11fdf746a9c6bb9d0193))

## [0.8.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.8.3...dashboard-components-v0.8.4) (2024-11-19)


### Features

* **components:** use a dropdown in the MutationFilter for selecting valid mutations and allow a `,` or `;` separated list as input for mutation filter ([#500](https://github.com/GenSpectrum/dashboard-components/issues/500)) ([2c5b252](https://github.com/GenSpectrum/dashboard-components/commit/2c5b2520257af8d6ce77e014eca23a09146b4638)), closes [#481](https://github.com/GenSpectrum/dashboard-components/issues/481) [#482](https://github.com/GenSpectrum/dashboard-components/issues/482)

## [0.8.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.8.2...dashboard-components-v0.8.3) (2024-11-19)


### Bug Fixes

* **components:** gs-mutations-over-time: also show proportion number when switching tabs ([#523](https://github.com/GenSpectrum/dashboard-components/issues/523)) ([321f5bf](https://github.com/GenSpectrum/dashboard-components/commit/321f5bfc3c5ce6e8c7c1723eb11428b80d023115))
* **components:** remove corresponding event listeners when destroying a graph ([#525](https://github.com/GenSpectrum/dashboard-components/issues/525)) ([06c3664](https://github.com/GenSpectrum/dashboard-components/commit/06c3664735f0e06d1b5ce4587d4e106442324181))

## [0.8.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.8.1...dashboard-components-v0.8.2) (2024-11-15)


### Features

* **components:** add info text for mutations-over-time component ([fbf7e42](https://github.com/GenSpectrum/dashboard-components/commit/fbf7e42517f3001c491b006dcb99f363f504817f))
* **components:** show no data message for strict filters on mutation over time ([d7565ce](https://github.com/GenSpectrum/dashboard-components/commit/d7565ce4dae4412472e68a65d7e2592a155bb525)), closes [#487](https://github.com/GenSpectrum/dashboard-components/issues/487)


### Bug Fixes

* **components:** show no data indicator on mutation over time instead of error ([d621fdd](https://github.com/GenSpectrum/dashboard-components/commit/d621fdd03b624a6d2411d4a87878ea9d626f0ce6)), closes [#501](https://github.com/GenSpectrum/dashboard-components/issues/501)

## [0.8.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.8.0...dashboard-components-v0.8.1) (2024-11-15)


### Features

* **components:** add reload button when a components fails ([5b79d1a](https://github.com/GenSpectrum/dashboard-components/commit/5b79d1adc2af7bf453b2641d1f78a475c2250cd9)), closes [#497](https://github.com/GenSpectrum/dashboard-components/issues/497)
* **components:** properly handle errors when connection to LAPIS fails ([a9322b9](https://github.com/GenSpectrum/dashboard-components/commit/a9322b9b28443ee8ad685279915e77d9165a46e2))

## [0.8.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.7.2...dashboard-components-v0.8.0) (2024-11-15)


### ⚠ BREAKING CHANGES

* **components:** removed unused and inaccurate 'gs-mutation-filter-on-blur' handle from MutationFilter (also did not fire after removing mutation queries), use 'gs-mutation-filter-changed' instead

### Features

* **components:** remove 'gs-mutation-filter-on-blur' handle from MutationFilter ([#511](https://github.com/GenSpectrum/dashboard-components/issues/511)) ([8f2982e](https://github.com/GenSpectrum/dashboard-components/commit/8f2982e562b1e0108a97837fe707d2ffcd90d31b))


### Bug Fixes

* **components:** mutation over time worker runs on message change ([553c2e9](https://github.com/GenSpectrum/dashboard-components/commit/553c2e98ad935d520ea7495284e9fbb4228882aa)), closes [#509](https://github.com/GenSpectrum/dashboard-components/issues/509)

## [0.7.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.7.1...dashboard-components-v0.7.2) (2024-11-15)


### Bug Fixes

* **components:** show no data message for prevalence over time ([6cef453](https://github.com/GenSpectrum/dashboard-components/commit/6cef4537b86cff1fc0258c7b31fcd4fa155bf5d3)), closes [#502](https://github.com/GenSpectrum/dashboard-components/issues/502)

## [0.7.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.7.0...dashboard-components-v0.7.1) (2024-11-11)


### Features

* **components:** gs-aggregate: add code example to info box ([e2ec1ac](https://github.com/GenSpectrum/dashboard-components/commit/e2ec1ac07e24467f70b3f1ff8a96a2bf1836e103)), closes [#479](https://github.com/GenSpectrum/dashboard-components/issues/479)
* **components:** gs-mutation-comparison: add code example to info box ([fb0cc0d](https://github.com/GenSpectrum/dashboard-components/commit/fb0cc0d7395be02957d5784ee07c5285432d78a0)), closes [#479](https://github.com/GenSpectrum/dashboard-components/issues/479)
* **components:** gs-mutations-over-time: add code example to info box ([3cbadea](https://github.com/GenSpectrum/dashboard-components/commit/3cbadea5ca525e27abc830f8c2588eb4e7c7ad75)), closes [#479](https://github.com/GenSpectrum/dashboard-components/issues/479)
* **components:** gs-mutations: add code example to info box ([eac884a](https://github.com/GenSpectrum/dashboard-components/commit/eac884a9ac71b85095904c12f9e3fc98cd55411c)), closes [#479](https://github.com/GenSpectrum/dashboard-components/issues/479)
* **components:** gs-number-sequences-over-time: add code example to info box ([303059c](https://github.com/GenSpectrum/dashboard-components/commit/303059c973989d23b84b8a79df277ac323ffb77e)), closes [#479](https://github.com/GenSpectrum/dashboard-components/issues/479)
* **components:** gs-relative-growth-advantage: add code example to info box ([0f54537](https://github.com/GenSpectrum/dashboard-components/commit/0f545370d39ac2bbec38b547269d6108cdce5949)), closes [#479](https://github.com/GenSpectrum/dashboard-components/issues/479)

## [0.7.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.19...dashboard-components-v0.7.0) (2024-11-07)


### ⚠ BREAKING CHANGES

* **components:** remove `customSelectOptions` from gs-date-range-selector. Use `dateRangeOptions` instead.

### Features

* **components:** gs-date-range-selector: replace `customSelectOptions` by `dateRangeOptions` ([a3ef17e](https://github.com/GenSpectrum/dashboard-components/commit/a3ef17e6c23297eb3a057dcbb167f33f83707bd9)), closes [#473](https://github.com/GenSpectrum/dashboard-components/issues/473)

## [0.6.19](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.18...dashboard-components-v0.6.19) (2024-11-06)


### Bug Fixes

* **components:** correctly export tag of mutations over time ([896d30b](https://github.com/GenSpectrum/dashboard-components/commit/896d30ba04fd503667bf4fa238592a794d049bc3))
* **components:** mutation over time initial query with missing dates [#483](https://github.com/GenSpectrum/dashboard-components/pull/483) ([42dcc4e](https://github.com/GenSpectrum/dashboard-components/commit/42dcc4e8a1844bcc5143a6e209d3c63392b2a6e5))


### Performance Improvements

* **components:** improve performance of mutations over time filters [#483](https://github.com/GenSpectrum/dashboard-components/pull/483) ([ea78935](https://github.com/GenSpectrum/dashboard-components/commit/ea7893507c2d76a0593e1bd6d938236db03d3b08))
* **components:** use web worker for mutations over time calculation [#483](https://github.com/GenSpectrum/dashboard-components/pull/483) ([c48f4b0](https://github.com/GenSpectrum/dashboard-components/commit/c48f4b0a877448f87706700648d474746ed515a3))

## [0.6.18](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.17...dashboard-components-v0.6.18) (2024-09-26)


### Bug Fixes

* **components:** fix react type of gs-text-input ([dae0d5d](https://github.com/GenSpectrum/dashboard-components/commit/dae0d5dc5113c0239eba904a2fac5b6d5c215aa5))

## [0.6.17](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.16...dashboard-components-v0.6.17) (2024-09-25)


### Features

* **components:** add react support ([32bf97d](https://github.com/GenSpectrum/dashboard-components/commit/32bf97d0b4f92560d02378c70d11eaf96ad6a541))

## [0.6.16](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.15...dashboard-components-v0.6.16) (2024-08-22)


### Features

* **components:** mutations over time: change label of proportion selector [#409](https://github.com/GenSpectrum/dashboard-components/issues/409) ([79b307b](https://github.com/GenSpectrum/dashboard-components/commit/79b307bbfd8cef11f2becde882f453b9dc142e75))

## [0.6.15](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.14...dashboard-components-v0.6.15) (2024-08-21)


### Features

* **components:** also display error details when LAPIS calls fail ([fbb16a4](https://github.com/GenSpectrum/dashboard-components/commit/fbb16a42de7641f456e50bc4d3d79a42efdbac5c)), closes [#366](https://github.com/GenSpectrum/dashboard-components/issues/366)
* **components:** dispatch `gs-error` event when an error occurs ([c608a60](https://github.com/GenSpectrum/dashboard-components/commit/c608a604b76d3124136a61354ee87dbe4ecc9291)), closes [#366](https://github.com/GenSpectrum/dashboard-components/issues/366)

## [0.6.14](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.13...dashboard-components-v0.6.14) (2024-08-20)


### Features

* **components:** mutations over time: also show total number of available sequences in tooltip ([141540e](https://github.com/GenSpectrum/dashboard-components/commit/141540effb8238c1a521eed51adfa21bef09ae04)), closes [#386](https://github.com/GenSpectrum/dashboard-components/issues/386)
* **components:** proportion selector: indicate error when min percentage &gt; max percentage ([649a9b8](https://github.com/GenSpectrum/dashboard-components/commit/649a9b86de2adf174f47eca49aaf03677945fa2b)), closes [#115](https://github.com/GenSpectrum/dashboard-components/issues/115)


### Bug Fixes

* **components:** don't bundle dependencies, publish separate standalone bundle instead ([eed1710](https://github.com/GenSpectrum/dashboard-components/commit/eed171091367ea3eb9f2178ea820743dc3c3a3b7)), closes [#407](https://github.com/GenSpectrum/dashboard-components/issues/407)

## [0.6.13](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.12...dashboard-components-v0.6.13) (2024-08-02)


### Bug Fixes

* **components:** reduce flashiness of loading skeletons ([3b14326](https://github.com/GenSpectrum/dashboard-components/commit/3b143268800975b6bdd8c69593ad5b97d8c556c6)), closes [#292](https://github.com/GenSpectrum/dashboard-components/issues/292)

## [0.6.12](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.11...dashboard-components-v0.6.12) (2024-07-31)


### Features

* **components:** add delay for proportion filter [#421](https://github.com/GenSpectrum/dashboard-components/issues/421) ([aac7100](https://github.com/GenSpectrum/dashboard-components/commit/aac710018424e2f376fa9fbfc0d32d618e31fa71))
* **components:** add select all/none button to dropdown selector [#361](https://github.com/GenSpectrum/dashboard-components/issues/361) ([fdce127](https://github.com/GenSpectrum/dashboard-components/commit/fdce127d931e1bbce13901a5199a01804ed14f85))
* **components:** set toolbar components to a fixed width [#389](https://github.com/GenSpectrum/dashboard-components/issues/389) ([c7b1b3b](https://github.com/GenSpectrum/dashboard-components/commit/c7b1b3b661257a5e8ce24de532d9707d03ad0507))


### Bug Fixes

* **components:** proportion selector no longer removes dot on input ([8a0b814](https://github.com/GenSpectrum/dashboard-components/commit/8a0b81468cbbe208db1315e545ababc432b823c5))
* **components:** rerender number of sequences over time when input changes [#395](https://github.com/GenSpectrum/dashboard-components/issues/395) ([1286031](https://github.com/GenSpectrum/dashboard-components/commit/128603123dbc6d1a357fc3876b72be22a082a30f))


### Performance Improvements

* **components:** speed up mutations over time proportion filter  [#388](https://github.com/GenSpectrum/dashboard-components/issues/388) ([f23e510](https://github.com/GenSpectrum/dashboard-components/commit/f23e510b569a5a98f4d68c079d44961dedd15c09))

## [0.6.11](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.10...dashboard-components-v0.6.11) (2024-07-30)


### Features

* **components:** add info texts for four components ([2ecd695](https://github.com/GenSpectrum/dashboard-components/commit/2ecd695a51bbca82a890781dd3cef666dca72294)), closes [#415](https://github.com/GenSpectrum/dashboard-components/issues/415) [#416](https://github.com/GenSpectrum/dashboard-components/issues/416) [#417](https://github.com/GenSpectrum/dashboard-components/issues/417) [#418](https://github.com/GenSpectrum/dashboard-components/issues/418)
* **components:** prevalence over time: add code example and link to codepen to info box [#404](https://github.com/GenSpectrum/dashboard-components/issues/404) ([3b22850](https://github.com/GenSpectrum/dashboard-components/commit/3b228501d62176ac131a7a3975d94e69011bf82d))

## [0.6.10](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.9...dashboard-components-v0.6.10) (2024-07-29)


### Features

* **components:** add button to show a component in fullscreen [#405](https://github.com/GenSpectrum/dashboard-components/issues/405) ([c5bc0cc](https://github.com/GenSpectrum/dashboard-components/commit/c5bc0cc59ca77273074a666d0e2eeb0dd589b502))


### Bug Fixes

* **components:** mutations over time: filter mutations rows by proportion according to overall proportion ([37775c0](https://github.com/GenSpectrum/dashboard-components/commit/37775c05e97a8182f4999f2198c4377fe5117818)), closes [#387](https://github.com/GenSpectrum/dashboard-components/issues/387)

## [0.6.9](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.8...dashboard-components-v0.6.9) (2024-07-26)


### Features

* **components:** provide a standalone JS bundle ([#400](https://github.com/GenSpectrum/dashboard-components/issues/400)) ([1ddc72b](https://github.com/GenSpectrum/dashboard-components/commit/39c68816b9d8da3bd1b1d3617574478b0b0b6215))

## [0.6.8](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.7...dashboard-components-v0.6.8) (2024-07-25)


### Features

* **components:** mutations over time: sort grid rows by mutations ([8833d90](https://github.com/GenSpectrum/dashboard-components/commit/8833d900b8a67fbacf4408eda94ebe681190fcb9)), closes [#384](https://github.com/GenSpectrum/dashboard-components/issues/384)


### Bug Fixes

* **components:** fix missing `return` when sorting mutations by segments/genes ([abdd446](https://github.com/GenSpectrum/dashboard-components/commit/abdd446d88f740ae81538f0825902550f99f02c2))

## [0.6.7](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.6...dashboard-components-v0.6.7) (2024-07-25)


### Features

* **components:** add color scale selector to mutations over time [#354](https://github.com/GenSpectrum/dashboard-components/issues/354) ([5b539a8](https://github.com/GenSpectrum/dashboard-components/commit/5b539a826d820fe6a9f91073921effe659773e3f))
* **components:** change info box to modal [#348](https://github.com/GenSpectrum/dashboard-components/issues/348) ([c7810e8](https://github.com/GenSpectrum/dashboard-components/commit/c7810e829a3a667c650095eb5792a4b987b349fa))
* **components:** hide proportion text on small mutations over time windows [#377](https://github.com/GenSpectrum/dashboard-components/issues/377) ([d8b1385](https://github.com/GenSpectrum/dashboard-components/commit/d8b13855c3d8ea77328d342e81a7794cdc4aca54))

## [0.6.6](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.5...dashboard-components-v0.6.6) (2024-07-23)


### Features

* **components:** mutations over time: add button to download the data ([ec304df](https://github.com/GenSpectrum/dashboard-components/commit/ec304df23ebabec301772793eb479e0812018c77)), closes [#362](https://github.com/GenSpectrum/dashboard-components/issues/362)


### Bug Fixes

* **components:** change week display format to `YYYY-[W]WW` (e.g. `2024-W03`) ([e24e4d8](https://github.com/GenSpectrum/dashboard-components/commit/e24e4d89a6084a480413320059c56b99c8b1c55e))
* **components:** mutations over time: position tooltip using css (instead of floatingUi) for better performance ([f5d8db0](https://github.com/GenSpectrum/dashboard-components/commit/f5d8db09e310c530a2b128d93b264bc23073ffc7))

## [0.6.5](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.4...dashboard-components-v0.6.5) (2024-07-22)


### Bug Fixes

* **components:** mutations over time: still show the toolbar when there are too many mutations ([e67d9de](https://github.com/GenSpectrum/dashboard-components/commit/e67d9dec006e73e29f4716dc0670d095ad5b18b4))

## [0.6.4](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.3...dashboard-components-v0.6.4) (2024-07-22)


### Features

* **components:** tooltip for mutations over time grid [#353](https://github.com/GenSpectrum/dashboard-components/issues/353) ([6dc3517](https://github.com/GenSpectrum/dashboard-components/commit/6dc3517b14f13b807b468dceb028b3691fd68365))


### Bug Fixes

* **components:** fix last day of iso week ([6ec2d9d](https://github.com/GenSpectrum/dashboard-components/commit/6ec2d9d53196fa8b5edd8439713348082cbbd4b3))
* **components:** mutations over time: limit the number of rows and columns that can be displayed in the grid ([520d196](https://github.com/GenSpectrum/dashboard-components/commit/520d196695f03e36a793a1548314bb7efcb26e1e)), closes [#367](https://github.com/GenSpectrum/dashboard-components/issues/367)

## [0.6.3](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.2...dashboard-components-v0.6.3) (2024-07-22)


### Features

* **components:** initial mutations over time component ([114a0a4](https://github.com/GenSpectrum/dashboard-components/commit/114a0a408d027478ff0b6f452e0d6d5e4d6e0182))

## [0.6.2](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.1...dashboard-components-v0.6.2) (2024-07-18)


### Bug Fixes

* **components:** export lineage filter ([5d9f53d](https://github.com/GenSpectrum/dashboard-components/commit/5d9f53d03eacd8af841dbad4f0e03fdd0a19c75a)), closes [#324](https://github.com/GenSpectrum/dashboard-components/issues/324)

## [0.6.1](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.6.0...dashboard-components-v0.6.1) (2024-07-18)


### Features

* **components:** add lineage filter component ([b398f22](https://github.com/GenSpectrum/dashboard-components/commit/b398f22272994a786368bfd2e0cc1c588c7fc93a)), closes [#324](https://github.com/GenSpectrum/dashboard-components/issues/324)

## [0.6.0](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.7...dashboard-components-v0.6.0) (2024-07-18)


### ⚠ BREAKING CHANGES

* **components:** remove the `headline` attribute from all visualization components. Instead, dashboard developers should simply create a headline themselves, outside the component, using standard HTML/CSS.

### Features

* **components:** remove `headline` from all visualization components ([47a6626](https://github.com/GenSpectrum/dashboard-components/commit/47a6626de12a39e617f5c8dab15d0eb077b0d025)), closes [#350](https://github.com/GenSpectrum/dashboard-components/issues/350)

## [0.5.7](https://github.com/GenSpectrum/dashboard-components/compare/dashboard-components-v0.5.6...dashboard-components-v0.5.7) (2024-07-16)


### Features

* **components:** number sequences over time: add info and download button ([6f184dc](https://github.com/GenSpectrum/dashboard-components/commit/6f184dce91814526b863e74187841d4f14d76770)), closes [#328](https://github.com/GenSpectrum/dashboard-components/issues/328)
* **components:** number sequences over time: add logarithmic scale for charts ([2238b84](https://github.com/GenSpectrum/dashboard-components/commit/2238b8434cf5e7cd12671f47a5f1cccbde4d1543)), closes [#333](https://github.com/GenSpectrum/dashboard-components/issues/333)


### Bug Fixes

* **components:** unify casing of downloaded files to snake case ([90a594c](https://github.com/GenSpectrum/dashboard-components/commit/90a594c7b2ab64becc220c64c359f88de2cdec18))

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
