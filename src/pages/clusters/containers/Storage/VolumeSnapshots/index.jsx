/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
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
 *
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { observer, inject } from 'mobx-react'
import Banner from 'components/Cards/Banner'
import { renderRoutes } from 'utils/router.config'
import VolumeStore from 'stores/volume'
import routes from './routes'

@inject('rootStore')
@observer
export default class VolumesSnapshots extends React.Component {
  store = new VolumeStore()

  get tips() {
    return [
      {
        title: t('WHAT_IS_VOLUME_SNAPSHOT_CLASS_Q'),
        description: t('WHAT_IS_VOLUME_SNAPSHOT_CLASS_A'),
      },
      {
        title: t('WHAT_IS_VOLUME_SNAPSHOT_CONTENT_Q'),
        description: t('WHAT_IS_VOLUME_SNAPSHOT_CONTENT_A'),
      },
    ]
  }

  get bannerProps() {
    return {
      className: 'margin-b12',
      description: t('VOLUME_SNAPSHOT_DESC'),
      module: 'VOLUME_SNAPSHOT',
      title: t('VOLUME_SNAPSHOT_PL'),
    }
  }

  get routes() {
    return routes
      .filter(item => !!item.title)
      .map(item => ({
        ...item,
        name: item.path.split('/').pop(),
      }))
  }

  componentDidMount() {
    this.store.getKsVersion(this.props.match.params)
  }

  renderBanner() {
    if (this.store.ksVersion >= 3.0) {
      return (
        <Banner {...this.bannerProps} tips={this.tips} routes={this.routes} />
      )
    }
    return <Banner {...this.bannerProps} />
  }

  render() {
    return (
      <>
        {this.renderBanner()}
        {renderRoutes(routes)}
      </>
    )
  }
}
