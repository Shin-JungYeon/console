/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2022 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { ArrayInput } from 'components/Inputs'

import PropTypes from 'prop-types'
import { Icon, Form, Select } from '@kube-design/components'
import { Modal } from 'components/Base'
import { get } from 'lodash'
import DevopsStore from 'stores/devops'
import CodeStore from 'stores/codeRepo'
import CDStore from 'stores/cd'
import { toJS } from 'mobx'
import Destinations from './Destinations'
import styles from './index.scss'

export default class CDAllowListModal extends React.Component {
  static propTypes = {
    formTemplate: PropTypes.object,
    visible: PropTypes.bool,
    isSubmitting: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    formTemplate: {},
    visible: false,
    isSubmitting: false,
    onOk() {},
    onCancel() {},
  }

  state = {
    formTemplate: {},
    options: [],
    clusters: [],
  }

  store = new DevopsStore()

  codeStore = new CodeStore()

  cdStore = new CDStore()

  formRef = React.createRef()

  componentDidMount() {
    this.initFormTemplate()
    this.fetchClusters()
    this.getRepoList()
  }

  getRepoList = async () => {
    const { devops } = this.props
    await this.codeStore.fetchList({ devops, limit: -1 })
    const options = this.codeStore.list.data.map(item => {
      return {
        label: item.name,
        value: item.repoURL,
        icon: item.provider,
      }
    })
    this.setState({ options })
  }

  fetchClusters = async () => {
    await this.cdStore.getClustersList()
    const clusters = this.cdStore.clustersList.map(item => ({
      label: item.label,
      value: item.name,
      server: item.server,
    }))
    this.setState({ clusters })
  }

  initFormTemplate = () => {
    this.store.fetchDetail({ ...this.props }).then(() => {
      const argo = get(toJS(this.store.detail), '_originData.spec.argo', {})
      this.setState({
        formTemplate: { spec: { argo } },
      })
    })
  }

  checkItemValid = value => {
    return value !== ''
  }

  sourceReposValidator = (rule, value, callback) => {
    if (!value) {
      return callback()
    }

    if (value.length > 0) {
      const arr = []
      value.forEach(item => {
        if (arr.includes(item)) {
          return callback({ message: t('CODE_REPOSITORY_EXIST_DESC') })
        }
        arr.push(item)
      })
    }

    callback()
  }

  destinationsValidator = (rule, value, callback) => {
    if (!value) {
      return callback()
    }

    if (value.length > 0) {
      const data = []
      value.forEach(item => {
        if (data.includes(item.namespace)) {
          return callback({ message: t('DEPLOYMENT_LOCATION_EXIST_DESC') })
        }
        data.push(item.namespace)
      })
    }

    callback()
  }

  repoOptionRenderer = option => type => (
    <span className={styles.option}>
      <Icon name={option.icon} type={type === 'value' ? 'dark' : 'light'} />
      {option.label}
    </span>
  )

  render() {
    const { visible, onCancel, onOk } = this.props

    return (
      <Modal.Form
        width={960}
        title={t('EDIT_ALLOWLIST')}
        data={this.state.formTemplate}
        onCancel={onCancel}
        onOk={onOk}
        visible={visible}
        formRef={this.formRef}
      >
        <Form.Item
          label={t('CODE_REPO_PL')}
          rules={[{ validator: this.sourceReposValidator }]}
        >
          <ArrayInput
            name="spec.argo.sourceRepos"
            addText={t('ADD')}
            itemType="string"
            checkItemValid={this.checkItemValid}
          >
            <Select
              style={{ maxWidth: '100%' }}
              placeholder=" "
              options={this.state.options}
              valueRenderer={option => this.repoOptionRenderer(option)('value')}
              optionRenderer={option =>
                this.repoOptionRenderer(option)('option')
              }
            />
          </ArrayInput>
        </Form.Item>
        <Form.Item
          label={t('DEPLOYMENT_LOCATION_PL')}
          rules={[{ validator: this.destinationsValidator }]}
        >
          <ArrayInput
            name="spec.argo.destinations"
            itemType="object"
            addText={t('ADD')}
            checkItemValid={this.checkDestinationsValid}
          >
            <Destinations
              clusters={this.state.clusters}
              formtemplate={this.state.formTemplate}
            />
          </ArrayInput>
        </Form.Item>
      </Modal.Form>
    )
  }
}
