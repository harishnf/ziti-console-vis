/*
    Copyright NetFoundry Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {OverridesService} from "./overrides.service";
import {isEmpty, debounce} from "lodash"

@Component({
  selector: 'lib-overrides',
  templateUrl: './overrides.component.html',
  styleUrls: ['./overrides.component.scss']
})
export class OverridesComponent implements OnInit {
  @Input() identity: any = {};
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  services: any = [];
  configs: any = [];
  overrides: any = [];
  selectedServiceId;
  selectedConfigId;
  showMore = false;

  filterServicesDebounced = debounce(this.filterServices, 200);
  filterConfigsDebounced = debounce(this.filterConfigs, 200);

  @ViewChild('servicesList') servicesList: any;
  @ViewChild('configList') configList: any;

  constructor(public svc: OverridesService) {}

  ngOnInit() {
    this.loadOverrides();
    this.getServices('');
    this.getConfigs('');
  }

  filterServices(event) {
    this.getServices(event.target.value);
  }

  filterConfigs(event) {
    this.getConfigs(event.target.value);
  }

  serviceSelectionChanged(event) {
    const selectedService = this.services.find((service) => {
      return service.id === event.value;
    });
    if (selectedService) {
      this.servicesList.editableInputViewChild.nativeElement.value = selectedService.name;
    }
  }

  configSelectionChanged(event) {
    const selectedConfig = this.configs.find((config) => {
      return config.id === event.value;
    });
    if (selectedConfig) {
      this.configList.editableInputViewChild.nativeElement.value = selectedConfig.name;
    }
  }

  getServices(filter = '') {
    this.svc.loadServices(filter).then((result) => {
      this.services = result.data;
      //this.showMore = result.totalCount > result.limit;
    });
  }

  getConfigs(filter = '') {
    this.svc.loadConfigs(filter).then((result) => {
      this.configs = result.data;
    });
  }

  loadOverrides() {
    this.svc.loadOverrides(this.identity).then((overrides) => {
      this.overrides = overrides;
    });
  }

  addOverride() {
    this.svc.addOverride(this.identity, this.selectedServiceId, this.selectedConfigId).then((result) => {
      if (!result) {
        return;
      }
      this.loadOverrides();
      this.selectedConfigId = undefined;
      this.selectedServiceId = undefined;
      this.servicesList.clear();
      this.servicesList.resetFilter();
      this.configList.clear();
      this.configList.resetFilter();
      this.getServices('');
    });
  }

  removeOverride(override) {
    this.svc.removeOverride(this.identity, override).then(() => {
      this.loadOverrides();
    });
  }

  get disableAddButton() {
    return isEmpty(this.selectedServiceId) || isEmpty(this.selectedConfigId);
  }
}
