<template>
  <div class="toolbar">
    <i title="向上增加一行" @click="addRowCol('top')" :class="{ disabled: !canAddRowCol }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M12 13C14.7614 13 17 15.2386 17 18C17 20.7614 14.7614 23 12 23C9.23858 23 7 20.7614 7 18C7 15.2386 9.23858 13 12 13ZM13 15H11V16.999L9 17V19L11 18.999V21H13V18.999L15 19V17L13 16.999V15ZM20 3C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11H4C3.44772 11 3 10.5523 3 10V4C3 3.44772 3.44772 3 4 3H20ZM5 5V9H19V5H5Z"
        ></path>
      </svg>
    </i>
    <i title="向下增加一行" @click="addRowCol('bottom')" :class="{ disabled: !canAddRowCol }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M20 13C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V14C3 13.4477 3.44772 13 4 13H20ZM19 15H5V19H19V15ZM12 1C14.7614 1 17 3.23858 17 6C17 8.76142 14.7614 11 12 11C9.23858 11 7 8.76142 7 6C7 3.23858 9.23858 1 12 1ZM13 3H11V4.999L9 5V7L11 6.999V9H13V6.999L15 7V5L13 4.999V3Z"
        ></path>
      </svg>
    </i>
    <i title="向左增加一列" @click="addRowCol('left')" :class="{ disabled: !canAddRowCol }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M10 3C10.5523 3 11 3.44772 11 4V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H10ZM9 5H5V19H9V5ZM18 7C20.7614 7 23 9.23858 23 12C23 14.7614 20.7614 17 18 17C15.2386 17 13 14.7614 13 12C13 9.23858 15.2386 7 18 7ZM19 9H17V10.999L15 11V13L17 12.999V15H19V12.999L21 13V11L19 10.999V9Z"
        ></path>
      </svg>
    </i>
    <i title="向右增加一列" @click="addRowCol('right')" :class="{ disabled: !canAddRowCol }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V4C13 3.44772 13.4477 3 14 3H20ZM19 5H15V19H19V5ZM6 7C8.76142 7 11 9.23858 11 12C11 14.7614 8.76142 17 6 17C3.23858 17 1 14.7614 1 12C1 9.23858 3.23858 7 6 7ZM7 9H5V10.999L3 11V13L5 12.999V15H7V12.999L9 13V11L7 10.999V9Z"
        ></path>
      </svg>
    </i>
    <i title="删除行" @click="removeRowCol('row')" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M20 5C20.5523 5 21 5.44772 21 6V12C21 12.5523 20.5523 13 20 13C20.628 13.8355 21 14.8743 21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 14.8743 11.372 13.8355 11.9998 12.9998L4 13C3.44772 13 3 12.5523 3 12V6C3 5.44772 3.44772 5 4 5H20ZM13 15V17H19V15H13ZM19 7H5V11H19V7Z"
        ></path>
      </svg>
    </i>
    <i title="删除列" @click="removeRowCol('col')" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M12 3C12.5523 3 13 3.44772 13 4L12.9998 11.9998C13.8355 11.372 14.8743 11 16 11C18.7614 11 21 13.2386 21 16C21 18.7614 18.7614 21 16 21C14.9681 21 14.0092 20.6874 13.2129 20.1518L13 20C13 20.5523 12.5523 21 12 21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3H12ZM11 5H7V19H11V5ZM19 15H13V17H19V15Z"
        ></path>
      </svg>
    </i>
    <div class="divider"></div>
    <i title="插入子级" @click="insertChild" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M21 3C21.5523 3 22 3.44772 22 4V11H20V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM21 13C21.5523 13 22 13.4477 22 14V20C22 20.5523 21.5523 21 21 21H13C12.4477 21 12 20.5523 12 20V14C12 13.4477 12.4477 13 13 13H21ZM20 15H14V19H20V15Z"
        ></path>
      </svg>
    </i>
    <i title="调整内部布局" @click="toggleLayout" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V20ZM11 5H5V19H11V5ZM19 13H13V19H19V13ZM19 5H13V11H19V5Z"
        ></path>
      </svg>
    </i>
    <div class="divider"></div>
    <i
      title="字体大小"
      @click="toggleFontSizePopup"
      :class="{ disabled: !hasSelection }"
      style="position: relative"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"
        ></path>
      </svg>

      <!-- 字体大小弹出层 -->
      <div
        v-if="vars.showFontSizePopup"
        class="font-size-popup"
        @click="(e) => e.stopPropagation()"
      >
        <div class="popup-content">
          <div class="popup-body">
            <Slider
              :model-value="vars.fontSize"
              :min="0.5"
              :max="1.5"
              :step="0.1"
              :show-labels="true"
              :show-tooltip="true"
              :format="(value) => `${value}rem`"
              @change="handleFontSizeChange"
            />
          </div>
        </div>
      </div>
    </i>
    <i title="斜体" @click="toggleFontItalic" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path>
      </svg>
    </i>
    <i title="删除线" @click="toggleFontThrough" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M17.1538 14C17.3846 14.5161 17.5 15.0893 17.5 15.7196C17.5 17.0625 16.9762 18.1116 15.9286 18.867C14.8809 19.6223 13.4335 20 11.5862 20C9.94674 20 8.32335 19.6185 6.71592 18.8555V16.6009C8.23538 17.4783 9.7908 17.917 11.3822 17.917C13.9333 17.917 15.2128 17.1846 15.2208 15.7196C15.2208 15.0939 15.0049 14.5598 14.5731 14.1173C14.5339 14.0772 14.4939 14.0381 14.4531 14H3V12H21V14H17.1538ZM13.076 11H7.62908C7.4566 10.8433 7.29616 10.6692 7.14776 10.4778C6.71592 9.92084 6.5 9.24559 6.5 8.45207C6.5 7.21602 6.96583 6.165 7.89749 5.299C8.82916 4.43299 10.2706 4 12.2219 4C13.6934 4 15.1009 4.32808 16.4444 4.98426V7.13591C15.2448 6.44921 13.9293 6.10587 12.4978 6.10587C10.0187 6.10587 8.77917 6.88793 8.77917 8.45207C8.77917 8.87172 8.99709 9.23796 9.43293 9.55079C9.86878 9.86362 10.4066 10.1135 11.0463 10.3004C11.6665 10.4816 12.3431 10.7148 13.076 11H13.076Z"
        ></path>
      </svg>
    </i>
    <i title="下划线" @click="toggleFontUnderline" :class="{ disabled: !hasSelection }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M8 3V12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12V3H18V12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12V3H8ZM4 20H20V22H4V20Z"
        ></path>
      </svg>
    </i>
    <i
      title="颜色"
      @click="toggleColorPopup"
      :class="{ disabled: !hasSelection }"
      style="position: relative"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M16.5357 15.9465L18.657 13.8252L15.475 10.6432L19.0106 7.10768L16.8892 4.98636L13.3537 8.52189L10.1717 5.33991L8.05041 7.46123L16.5357 15.9465ZM15.1215 17.3607L6.6362 8.87544L3.80777 11.7039L12.293 20.1892L15.1215 17.3607ZM13.3537 5.69346L16.1821 2.86504C16.5727 2.47451 17.2058 2.47451 17.5963 2.86504L21.1319 6.40057C21.5224 6.79109 21.5224 7.42426 21.1319 7.81478L18.3035 10.6432L20.7783 13.1181C21.1689 13.5086 21.1689 14.1418 20.7783 14.5323L13.0002 22.3105C12.6096 22.701 11.9765 22.701 11.5859 22.3105L1.68645 12.411C1.29592 12.0205 1.29592 11.3873 1.68645 10.9968L9.46462 3.21859C9.85515 2.82807 10.4883 2.82807 10.8788 3.21859L13.3537 5.69346Z"
        ></path>
      </svg>

      <ColorPicker :model-value="vars.showColorPopup" @select-color="handleColorSelect" />
    </i>
    <div class="divider"></div>
    <i
      title="搜索"
      @click="toggleSearchPopup"
      :class="{ active: vars.showSearchPopup }"
      style="position: relative"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
      >
        <path
          d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"
        ></path>
      </svg>

      <!-- 搜索弹出层 -->
      <div v-if="vars.showSearchPopup" class="search-popup" @click="(e) => e.stopPropagation()">
        <div class="popup-content">
          <div class="popup-body">
            <div class="search-input-wrapper">
              <input
                v-model="vars.searchQuery"
                type="text"
                class="search-input"
                placeholder="搜索..."
                @input="searchStore.setSearchQuery(($event.target as HTMLInputElement).value || '')"
                @focus="() => documentStore.clearSelection()"
                @keyup.esc="toggleSearchPopup"
              />
              <button v-if="vars.searchQuery" class="clear-button" @click="clearSearch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="replace-input-wrapper">
              <input
                v-model="vars.replaceQuery"
                type="text"
                class="search-input"
                placeholder="替换为..."
                @keyup.esc="toggleSearchPopup"
              />
              <button v-if="vars.replaceQuery" class="clear-button" @click="clearReplace">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="replace-buttons">
              <button
                class="replace-button"
                @click="replaceCurrent"
                :disabled="!vars.searchQuery || findMatchingCells(vars.searchQuery).length === 0"
              >
                替换
              </button>
              <button
                class="replace-button"
                @click="replaceAll"
                :disabled="!vars.searchQuery || findMatchingCells(vars.searchQuery).length === 0"
              >
                全部替换
              </button>
            </div>
          </div>
        </div>
      </div>
    </i>
    <i
      title="放大"
      @click="handleZoom('in')"
      :class="{ disabled: !hasSelection }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748ZM10 10V7H12V10H15V12H12V15H10V12H7V10H10Z"></path></svg>
    </i>
    <i
      title="缩小"
      @click="handleZoom('out')"
      :class="{ disabled: !documentStore.isZoomed() }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748ZM7 10H15V12H7V10Z"></path></svg>
    </i>
    <i title="保存" @click="handleSave">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path
          d="M18 19H19V6.82843L17.1716 5H16V9H7V5H5V19H6V12H18V19ZM4 3H18L20.7071 5.70711C20.8946 5.89464 21 6.149 21 6.41421V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM8 14V19H16V14H8Z"
        ></path>
      </svg>
    </i>
    <i title="求和" @click="handleSummation" :class="{ disabled: !summable }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path d="M5 18L12.6796 12L5 6V4H19V6H8.26348L16 12L8.26348 18H19V20H5V18Z"></path>
      </svg>
    </i>
    <i title="分享到局域网" @click="toggleSharePopup" style="position: relative" :class="{ active: peerStore.isConnected }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.1202 17.0228L8.92129 14.7324C8.19135 15.5125 7.15261 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C7.15255 8 8.19125 8.48746 8.92118 9.26746L13.1202 6.97713C13.0417 6.66441 13 6.33707 13 6C13 3.79086 14.7909 2 17 2C19.2091 2 21 3.79086 21 6C21 8.20914 19.2091 10 17 10C15.8474 10 14.8087 9.51251 14.0787 8.73246L9.87977 11.0228C9.9583 11.3355 10 11.6629 10 12C10 12.3371 9.95831 12.6644 9.87981 12.9771L14.0788 15.2675C14.8087 14.4875 15.8474 14 17 14C19.2091 14 21 15.7909 21 18C21 20.2091 19.2091 22 17 22C14.7909 22 13 20.2091 13 18C13 17.6629 13.0417 17.3355 13.1202 17.0228ZM6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14ZM17 8C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4C15.8954 4 15 4.89543 15 6C15 7.10457 15.8954 8 17 8ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z"></path></svg>

      <!-- 分享弹出层 -->
      <div v-if="vars.showSharePopup" class="share-popup" @click="(e) => e.stopPropagation()">
        <div class="popup-content">
          <div class="popup-header">
            <span>局域网分享文档</span>
            <div class="header-controls">
              <SwitchButton v-model="vars.peerConnectionEnabled" />
              <button class="close-button" @click="toggleSharePopup">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="popup-body">
            <div class="share-info">
              <p>1. 连接0.peerjs.com</p>
              <p v-if="peerStore.shareStatus" class="status-text">{{ peerStore.shareStatus }}</p>
              <p>2. 复制下方链接发给对方</p>
              <div v-if="peerStore.shareLink" class="share-link-container">
                <input
                  type="text"
                  :value="peerStore.shareLink"
                  readonly
                  class="share-link-input"
                />
                <button class="copy-button" @click="copyShareLink">复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </i>
    <i title="撤消" @click="handleUndo" :class="{ disabled: !historyStore.canUndo }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
      >
        <path
          d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"
        ></path>
      </svg>
    </i>
    <i title="重做" @click="handleRedo" :class="{ disabled: !historyStore.canRedo }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
      >
        <path
          d="M18.1716 6.99955H11C7.68629 6.99955 5 9.68584 5 12.9996C5 16.3133 7.68629 18.9996 11 18.9996H20V20.9996H11C6.58172 20.9996 3 17.4178 3 12.9996C3 8.58127 6.58172 4.99955 11 4.99955H18.1716L15.636 2.46402L17.0503 1.0498L22 5.99955L17.0503 10.9493L15.636 9.53509L18.1716 6.99955Z"
        ></path>
      </svg>
    </i>
  </div>
</template>

<script setup lang="ts">
import Slider from './Slider.vue'
import ColorPicker from './ColorPicker.vue'
import SwitchButton from './SwitchButton.vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useDocumentStore } from '@/stores/document.ts'
import type { CellData } from '../../env'
import {
  createCellData,
  createRowData,
  lookupCellData,
  lookupInnerGrid,
  updateCellFontSizeRecursive,
} from '@/utils/data.ts'
import emitter from '@/utils/bus.ts'
import { useSearchStore } from '@/stores/search.ts'
import { useHistoryStore } from '@/stores/history.ts'
import { getDBManager } from '@/utils/db.ts'
import { usePeerStore } from '@/stores/peer'

defineExpose({
  closePopup: (dialog: 'fontSize' | 'color' | 'search' | 'share') => {
    if (dialog === 'fontSize') {
      vars.value.showFontSizePopup = false
    } else if (dialog === 'color') {
      vars.value.showColorPopup = false
    } else if (dialog === 'search') {
      vars.value.showSearchPopup = false
    } else if (dialog === 'share') {
      vars.value.showSharePopup = false
    }
  },
})

const vars = ref({
  fontSize: 0.8,
  showFontSizePopup: false,
  showColorPopup: false,
  showSearchPopup: false,
  showSharePopup: false,
  searchQuery: '',
  replaceQuery: '',
  peerConnectionEnabled: false,
})
const documentStore = useDocumentStore()
const historyStore = useHistoryStore()
const searchStore = useSearchStore()
const peerStore = usePeerStore()

const dbManager = getDBManager()

const canAddRowCol = computed(() => {
  return documentStore.selectedCells.length === 1
})
const hasSelection = computed(() => {
  return documentStore.selectedCells.length > 0
})
const summable = computed(() => {
  const [rowSize, colSize] = documentStore.countSelectedRowColSize()
  return (rowSize === 1 && colSize > 2) || (rowSize > 2 && colSize === 1)
})

// 监听数据变化，记录历史（排除编辑中的数据）
watch(
  () => documentStore.gridData,
  (newData) => {
    // 如果有单元格正在编辑，不记录历史
    if (documentStore.editingCell) {
      return
    }
    historyStore.addHistory(JSON.stringify(newData), documentStore.selectedCells)
  },
  { deep: true },
)
watch(
  () => vars.value.showSearchPopup,
  (newData) => {
    searchStore.setSearchVisible(newData)
  },
)
watch(
  () => vars.value.searchQuery,
  (newText) => {
    searchStore.setSearchQuery(newText)
  },
)
watch(
  () => vars.value.peerConnectionEnabled,
  (enabled) => {
    if (enabled) {
      // 启用Peer连接
      peerStore.cleanupPeer()
      peerStore.setOnConnectedListener(() => {
        if (peerStore.isConnected) {
          peerStore.broadcast({ type: 'document', data: JSON.parse(JSON.stringify(documentStore.gridData))})
        }
      })
      peerStore.initializePeer()
    } else {
      // 禁用Peer连接
      peerStore.cleanupPeer()
    }
  },
)

const addRowCol = (edge: 'top' | 'bottom' | 'left' | 'right') => {
  if (documentStore.selectedCells.length !== 1) return

  let originCellPath = documentStore.selectedCells[0]
  const parts = originCellPath.split('>').map((it) => JSON.parse(it))
  const [row, col] = parts.pop()
  const parentGrid: CellData[][] = lookupInnerGrid(documentStore.gridData, parts)

  switch (edge) {
    case 'top':
      parentGrid.splice(row, 0, createRowData(parentGrid[0].length))
      originCellPath = parts.length
        ? `${parts.join('>')}>[${row + 1},${col}]`
        : `[${row + 1},${col}]`
      break
    case 'bottom':
      parentGrid.splice(row + 1, 0, createRowData(parentGrid[0].length))
      break
    case 'left':
      parentGrid.forEach((eachRow) => {
        eachRow.splice(col, 0, createCellData())
      })
      originCellPath = parts.length
        ? `${parts.join('>')}>[${row},${col + 1}]`
        : `[${row},${col + 1}]`
      break
    case 'right':
      parentGrid.forEach((eachRow) => {
        eachRow.splice(col + 1, 0, createCellData())
      })
      break
  }
  documentStore.addCellOnClick(originCellPath)
}

const removeRowCol = (type: 'row' | 'col') => {
  if (!documentStore.selectedCells.length) return

  const posArr = documentStore.selectedCells.map((path) => {
    const parts: [number, number][] = path.split('>').map((it) => JSON.parse(it))
    const pos: [number, number] = parts.pop()!
    return { parts, pos }
  })
  const parentCell = posArr[0].parts.length
    ? lookupCellData(documentStore.gridData, posArr[0].parts)
    : undefined
  const parentGrid: CellData[][] = lookupInnerGrid(documentStore.gridData, posArr[0].parts)

  switch (type) {
    case 'row':
      posArr
        .map((it) => it.pos[0])
        .filter((e, i, self) => i === self.indexOf(e))
        .sort()
        .forEach((row, index) => {
          parentGrid.splice(row - index, 1)
        })
      if (parentGrid.length === 0) {
        if (parentCell) {
          parentCell.innerGrid = undefined
        } else {
          parentGrid.push(createRowData(1))
        }
      }
      break
    case 'col':
      posArr
        .map((it) => it.pos[1])
        .filter((e, i, self) => i === self.indexOf(e))
        .sort()
        .forEach((col, index) => {
          parentGrid.forEach((row) => row.splice(col - index, 1))
        })
      if (parentGrid[0]?.length === 0) {
        if (parentCell) {
          parentCell.innerGrid = undefined
        } else {
          parentGrid.splice(0, parentGrid.length)
          parentGrid.push(createRowData(1))
        }
      }
      break
  }

  // 清除选中状态，因为删除后原位置可能不存在
  documentStore.clearSelection()
}

const insertChild = () => {
  if (!documentStore.selectedCells.length) return
  if (documentStore.selectedCells.length === 1) {
    const path = documentStore.selectedCells[0]
    emitter.emit('cell-inner', { path })
  } else if (documentStore.selectedCells.length > 1) {
    const path = documentStore.selectedCells[0]
    emitter.emit('cell-inner', { path, gridPath: documentStore.selectedCells })
  }
}

const toggleLayout = () => {
  if (!documentStore.selectedCells.length) return

  documentStore.selectedCells.forEach((it) => {
    const cell = lookupCellData(documentStore.gridData, it)!
    cell.flexDirection = !cell.flexDirection || cell.flexDirection === 'column' ? 'row' : 'column'
  })
}

const toggleFontSizePopup = () => {
  if (documentStore.selectedCells.length) {
    const firstCell = lookupCellData(documentStore.gridData, documentStore.selectedCells[0])
    vars.value.fontSize = firstCell?.fontSize || 0.8
    vars.value.showFontSizePopup = !vars.value.showFontSizePopup
  }
}

const handleFontSizeChange = (fontSize: number) => {
  if (!documentStore.selectedCells.length) return
  documentStore.selectedCells
    .map((it) => lookupCellData(documentStore.gridData, it)!)
    .forEach((cell) => {
      updateCellFontSizeRecursive(cell, fontSize)
    })
}

const toggleColorPopup = () => {
  if (documentStore.selectedCells.length) {
    vars.value.showColorPopup = !vars.value.showColorPopup
  }
}

const handleColorSelect = (color: string) => {
  if (!documentStore.selectedCells.length) return

  documentStore.selectedCells
    .map((it) => lookupCellData(documentStore.gridData, it)!)
    .forEach((cell) => {
      if (['white', '#fff', '#ffffff', '#FFF', '#FFFFFF', 'rgb(255, 255, 255)'].includes(color)) {
        cell.backgroundColor = undefined
        return
      }
      cell.backgroundColor = color
    })

  // 选择颜色后关闭弹窗
  vars.value.showColorPopup = false
}

const toggleSearchPopup = () => {
  vars.value.showSearchPopup = !vars.value.showSearchPopup
  if (vars.value.showSearchPopup) {
    nextTick(() => {
      const searchInput = document.querySelector('.search-popup input') as HTMLInputElement
      searchInput?.focus()
      searchInput?.select()
    })
  }
}

const clearSearch = () => {
  vars.value.searchQuery = ''
  vars.value.replaceQuery = ''
  searchStore.clearSearchQuery()
  const searchInput = document.querySelector('.search-popup input') as HTMLInputElement
  searchInput?.focus()
}

const clearReplace = () => {
  vars.value.replaceQuery = ''
  const searchInput = document.querySelector('.search-popup input') as HTMLInputElement
  searchInput?.focus()
}

const handleZoom = (type: 'in' | 'out') => {
  if (type === 'in') {
    documentStore.zoomIn()
  } else if (type === 'out') {
    documentStore.zoomOut()
  }
}

const handleSave = async () => {
  await documentStore.saveDocument(dbManager)
}

const handleSummation = () => {
  if (!summable.value) return

  const cells = documentStore.selectedCells.map((it) => lookupCellData(documentStore.gridData, it)!)
  const lastCell = cells.pop()!
  const sum = cells
    .map((it) => it.text)
    .filter((it) => !it || /^\-?\d+(\.\d+)?$/.test(it))
    .map((it) => Number(it || 0))
    .reduce((a, b) => a + b, 0)
  lastCell.text = sum.toString()
}

const toggleSharePopup = () => {
  vars.value.showSharePopup = !vars.value.showSharePopup

  if (vars.value.showSharePopup) {
    // 打开分享弹窗时初始化Peer连接
    vars.value.peerConnectionEnabled = peerStore.isConnected
  }
}

const handleUndo = () => {
  const previousData = historyStore.undo()
  if (previousData) {
    documentStore.setupGrid(JSON.parse(previousData.gridData))
    documentStore.setSelectedCells(previousData.selectedCells || [])
  }
}

const handleRedo = () => {
  const nextData = historyStore.redo()
  if (nextData) {
    documentStore.setupGrid(JSON.parse(nextData.gridData))
    documentStore.setSelectedCells(nextData.selectedCells || [])
  }
}

const toggleFontItalic = () => {
  if (!documentStore.selectedCells.length) return

  documentStore.selectedCells
    .map((it) => lookupCellData(documentStore.gridData, it)!)
    .forEach((cell) => {
      cell.fontItalic = !cell.fontItalic
    })
}

const toggleFontThrough = () => {
  if (!documentStore.selectedCells.length) return

  documentStore.selectedCells
    .map((it) => lookupCellData(documentStore.gridData, it)!)
    .forEach((cell) => {
      cell.fontThrough = !cell.fontThrough
    })
}

const toggleFontUnderline = () => {
  if (!documentStore.selectedCells.length) return

  documentStore.selectedCells
    .map((it) => lookupCellData(documentStore.gridData, it)!)
    .forEach((cell) => {
      cell.fontUnderline = !cell.fontUnderline
    })
}

const replaceCurrent = () => {
  if (!vars.value.searchQuery) return

  // 获取所有匹配的单元格
  const matchingCells = findMatchingCells(vars.value.searchQuery)
  if (matchingCells.length === 0) return

  // 替换第一个匹配的单元格
  const cell = lookupCellData(documentStore.gridData, matchingCells[0])
  if (cell && cell.text) {
    cell.text = cell.text.replace(
      new RegExp(escapeRegExp(vars.value.searchQuery), 'gi'),
      vars.value.replaceQuery || '',
    )
  }
}

const replaceAll = () => {
  if (!vars.value.searchQuery) return

  // 获取所有匹配的单元格
  const matchingCells = findMatchingCells(vars.value.searchQuery)
  if (matchingCells.length === 0) return

  // 替换所有匹配的单元格
  matchingCells.forEach((path) => {
    const cell = lookupCellData(documentStore.gridData, path)
    if (cell && cell.text) {
      cell.text = cell.text.replace(
        new RegExp(escapeRegExp(vars.value.searchQuery), 'gi'),
        vars.value.replaceQuery || '',
      )
    }
  })
}

const findMatchingCells = (searchTerm: string): string[] => {
  if (!searchTerm) return []

  const matchingCells: string[] = []
  const searchLower = searchTerm.toLowerCase()

  function searchGrid(grid: CellData[][], prefix: string = '') {
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const path = prefix ? `${prefix}>[${rowIndex},${colIndex}]` : `[${rowIndex},${colIndex}]`

        if (cell.text && cell.text.toLowerCase().includes(searchLower)) {
          matchingCells.push(path)
        }

        if (cell.innerGrid) {
          searchGrid(cell.innerGrid, path)
        }
      })
    })
  }

  searchGrid(documentStore.gridData)
  return matchingCells
}

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(peerStore.shareLink)
    // 可以添加一个简单的提示
    console.log('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;

  i {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;

    &:hover:not(.disabled) {
      background-color: #f0f0f0;
      color: #333;
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &.active {
      background-color: #e6f7ff;
      color: #1890ff;
    }
  }
}

.font-size-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
}

.popup-content {
  padding: 12px;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.replace-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
}

.replace-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.replace-button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #40a9ff;
    color: #40a9ff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:first-child {
    background: #f0f0f0;
  }

  &:last-child {
    background: #1890ff;
    color: white;
    border-color: #1890ff;

    &:hover:not(:disabled) {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #e0e0e0;
  margin: 0 4px;
}

.clear-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

.share-popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 400px;
}

.share-info {
  padding: 16px;
  line-height: 1.6;
  color: #333;
  font-size: 14px;
}

.share-info p {
  margin: 8px 0;
}

.status-text {
  color: #1890ff;
  font-size: 12px;
  margin-left: 8px;
}

.share-link-container {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.share-link-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  background-color: #f5f5f5;
  cursor: pointer;
}

.copy-button {
  padding: 6px 12px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #40a9ff;
    border-color: #40a9ff;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
  font-size: 16px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.popup-header .close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #666;
    background-color: #f0f0f0;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
