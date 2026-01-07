class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0); // dummy head
    this.tail = new Node(0, 0); // dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _addNode(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addNode(node);
  }

  _popTail() {
    let node = this.tail.prev;
    this._removeNode(node);
    return node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    let node = this.map.get(key);
    this._moveToHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      let node = this.map.get(key);
      node.value = value;
      this._moveToHead(node);
    } else {
      let node = new Node(key, value);
      this.map.set(key, node);
      this._addNode(node);

      if (this.map.size > this.capacity) {
        let tail = this._popTail();
        this.map.delete(tail.key);
      }
    }
  }

  toArray() {
    let arr = [];
    let current = this.head.next;
    while (current !== this.tail) {
      arr.push(current);
      current = current.next;
    }
    return arr;
  }
}

// ====== Visualizer Logic ======
const cache = new LRUCache(5);
const keyInput = document.getElementById('keyInput');
const valueInput = document.getElementById('valueInput');
const actionBtn = document.getElementById('actionBtn');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const cacheContainer = document.getElementById('cacheContainer');
const actionStatus = document.getElementById('actionStatus');

// Toggle between PUT/GET
modeToggle.addEventListener('change', () => {
  if (modeToggle.checked) {
    actionBtn.textContent = 'GET';
    valueInput.style.display = 'none';
    modeLabel.textContent = 'GET Mode';
  } else {
    actionBtn.textContent = 'PUT';
    valueInput.style.display = 'inline';
    modeLabel.textContent = 'PUT Mode';
  }
});

// Render cache nodes
function renderCache(highlightKey = null) {
  cacheContainer.innerHTML = '';
  const nodes = cache.toArray();
  nodes.forEach((node, idx) => {
    const div = document.createElement('div');
    div.className = 'cache-node';
    if (idx === 0) div.classList.add('mru');
    if (idx === nodes.length - 1) div.classList.add('lru');
    div.textContent = `${node.key}:${node.value}`;
    if (node.key == highlightKey) div.style.transform = 'scale(1.3)';
    cacheContainer.appendChild(div);
  });
}

// Handle action button
actionBtn.addEventListener('click', () => {
  const key = parseInt(keyInput.value);
  if (isNaN(key)) {
    actionStatus.textContent = 'Please enter a valid key!';
    return;
  }

  if (modeToggle.checked) {
    // GET mode
    const value = cache.get(key);
    if (value === -1) actionStatus.textContent = `Cache MISS for key=${key}`;
    else actionStatus.textContent = `Cache HIT for key=${key}, value=${value}`;
    renderCache(key);
  } else {
    // PUT mode
    const value = parseInt(valueInput.value);
    if (isNaN(value)) {
      actionStatus.textContent = 'Please enter a valid value!';
      return;
    }
    cache.put(key, value);
    actionStatus.textContent = `PUT key=${key}, value=${value}`;
    renderCache(key);
  }
});

// Initial render
renderCache();
