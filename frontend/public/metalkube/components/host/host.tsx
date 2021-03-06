import * as React from 'react';
import { connect } from 'react-redux';
import {
  BaremetalHostRole,
  BaremetalHostStatus,
  getHostMachineName,
  getHostBmcAddress,
  getName,
  getNamespace,
  getResource,
  getSimpleHostStatus,
  getUid,
} from 'kubevirt-web-ui-components';

import { actions, referenceForModel } from '../../../kubevirt/module/okdk8s';

import {
  ListHeader,
  ColHead,
  List,
  ListPage,
  ResourceRow,
} from '../factory/okdfactory';
import { ResourceLink, ResourceKebab } from '../utils/okdutils';
import MachineCell from './machine-cell';
import { WithResources } from '../../../kubevirt/components/utils/withResources';
import { BaremetalHostModel, MachineModel, NodeModel } from '../../models';
import { menuActions } from './menu-actions';
import { openCreateBaremetalHostModal } from '../modals/create-host-modal';

const nameColumnClasses = 'col-lg-2 col-md-4 col-sm-6 col-xs-6';
const statusColumnClasses = 'col-lg-2 col-md-4 hidden-sm hidden-xs';
const machineColumnClasses = 'col-lg-3 visible-lg';
const roleColumnClasses = 'col-lg-2 visible-lg';
const addressColumnClasses = 'col-lg-2 visible-lg';

const HostHeader = props => (
  <ListHeader>
    <ColHead {...props} className={nameColumnClasses} sortField="metadata.name">
      Name
    </ColHead>
    <ColHead {...props} className={statusColumnClasses}>
      Status
    </ColHead>
    <ColHead {...props} className={machineColumnClasses}>
      Machine
    </ColHead>
    <ColHead {...props} className={roleColumnClasses}>
      Role
    </ColHead>
    <ColHead
      {...props}
      className={addressColumnClasses}
      sortField="spec.bmc.address"
    >
      Management Address
    </ColHead>
  </ListHeader>
);

const HostRow = ({ obj: host }) => {
  const name = getName(host);
  const namespace = getNamespace(host);
  const uid = getUid(host);
  const machineName = getHostMachineName(host);
  const address = getHostBmcAddress(host);

  const machineResource = {
    kind: referenceForModel(MachineModel),
    name: machineName,
    namespaced: true,
    namespace,
    isList: false,
    prop: 'machine',
  };

  const hostResourceMap = {
    machine: {
      resource: machineResource,
    },
    nodes: {
      resource: getResource(NodeModel, { namespaced: false }),
    },
  };

  const hostResources = machineName
    ? [machineResource, getResource(NodeModel, { namespaced: false })]
    : [];

  return (
    <ResourceRow obj={host}>
      <div className={nameColumnClasses}>
        <ResourceLink
          kind={BaremetalHostModel.kind}
          name={name}
          namespace={namespace}
          title={uid}
        />
      </div>
      <div className={statusColumnClasses}>
        <WithResources resourceMap={machineName ? hostResourceMap : {}}>
          <BaremetalHostStatus host={host} />
        </WithResources>
      </div>
      <div className={machineColumnClasses}>
        <MachineCell host={host} />
      </div>
      <div className={roleColumnClasses}>
        <WithResources resourceMap={machineName ? hostResourceMap : {}}>
          <BaremetalHostRole />
        </WithResources>
      </div>
      <div className={addressColumnClasses}>{address}</div>
      <div className="dropdown-kebab-pf">
        <ResourceKebab
          actions={menuActions}
          kind={BaremetalHostModel.kind}
          resource={host}
          resources={hostResources}
        />
      </div>
    </ResourceRow>
  );
};

const HostList = props => <List {...props} Header={HostHeader} Row={HostRow} />;

const filters = [
  {
    type: 'baremetalhost-status',
    selected: ['online', 'offline'],
    reducer: getSimpleHostStatus,
    items: [
      { id: 'online', title: 'online' },
      { id: 'offline', title: 'offline' },
    ],
  },
];

const createProps = ns => ({
  onClick: () => openCreateBaremetalHostModal(ns),
});

const mapStateToProps = ({ k8s }) => ({
  k8s,
});

const mapDispatchToProps = () => ({
  stopK8sWatch: actions.stopK8sWatch,
  watchK8sList: actions.watchK8sList,
});

/* eslint-disable no-unused-vars, no-undef */
export type BaremetalHostsPageProps = {
  namespace: string;
};
/* eslint-enable no-unused-vars, no-undef */

class BaremetalHostsPage_ extends React.Component<BaremetalHostsPageProps> {
  render() {
    return (
      <ListPage
        {...this.props}
        canCreate
        rowFilters={filters}
        createProps={createProps(this.props.namespace)}
        createButtonText="Add Host"
        kind={BaremetalHostModel.kind}
        ListComponent={HostList}
      />
    );
  }
}

export const BaremetalHostsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaremetalHostsPage_);
