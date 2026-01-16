// --- Helper function for pretty printing the tree ---
const prettyPrint = (node, prefix = '', isLeft = true) => {
  if (node === null) {
    return;
  }
  if (node.right !== null) {
    prettyPrint(node.right, `${prefix}${isLeft ? '│ ' : ' '}`, false);
  }
  console.log(`${prefix}${isLeft ? '└── ' : '┌── '}${node.data}`);
  if (node.left !== null) {
    prettyPrint(node.left, `${prefix}${isLeft ? ' ' : '│ '}`, true);
  }
};

// --- Node Factory ---
const Node = (data = null, left = null, right = null) => {
  return { data, left, right };
};

// --- Tree Class ---
const Tree = (array) => {
  let root = null;

  // Helper to sort and remove duplicates from the input array
  const cleanAndSort = (arr) => {
    const unique = [...new Set(arr)];
    return unique.sort((a, b) => a - b);
  };

  // buildTree function (internal helper)
  const buildTree = (arr, start, end) => {
    if (start > end) return null;

    const mid = Math.floor((start + end) / 2);
    const node = Node(arr[mid]);

    node.left = buildTree(arr, start, mid - 1);
    node.right = buildTree(arr, mid + 1, end);

    return node;
  };

  // Initialize the tree upon creation
  const sortedArray = cleanAndSort(array);
  root = buildTree(sortedArray, 0, sortedArray.length - 1);

  // --- Public methods start here ---

  // Get the root node (useful for prettyPrint and external checks)
  const getRoot = () => root;

  // insert(value)
  const insert = (value) => {
    const insertRecursive = (node, val) => {
      if (node === null) return Node(val);
      if (val < node.data) {
        node.left = insertRecursive(node.left, val);
      } else if (val > node.data) {
        node.right = insertRecursive(node.right, val);
      }
      // Value already exists, do nothing as per assignment constraints
      return node;
    };
    // Check if value already exists to prevent duplicate insertion at the root level call
    if (!find(value)) {
        root = insertRecursive(root, value);
    }
  };

  // deleteItem(value)
  const deleteItem = (value) => {
    const findMinNode = (node) => {
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    };

    const deleteRecursive = (node, val) => {
      if (node === null) return null;

      if (val < node.data) {
        node.left = deleteRecursive(node.left, val);
      } else if (val > node.data) {
        node.right = deleteRecursive(node.right, val);
      } else {
        // Case 1: Node with only one child or no child
        if (node.left === null) {
          return node.right;
        } else if (node.right === null) {
          return node.left;
        }
        // Case 2: Node with two children (find in-order successor, the smallest in the right subtree)
        const temp = findMinNode(node.right);
        node.data = temp.data; // Replace with in-order successor's data
        node.right = deleteRecursive(node.right, temp.data); // Delete the in-order successor from the right subtree
      }
      return node;
    };
    root = deleteRecursive(root, value);
  };

  // find(value)
  const find = (value) => {
    const findRecursive = (node, val) => {
      if (node === null || node.data === val) return node;
      if (val < node.data) return findRecursive(node.left, val);
      return findRecursive(node.right, val);
    };
    return findRecursive(root, value);
  };

  // levelOrderForEach(callback)
  const levelOrderForEach = (callback) => {
    if (!callback) throw new Error("Callback function is required.");
    if (!root) return;

    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift();
      callback(current);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  };

  // Traversal helper for inorder, preorder, postorder
  const depthFirstForEach = (callback, order = 'inOrder') => {
    if (!callback) throw new Error("Callback function is required.");

    const traverse = (node) => {
      if (node === null) return;
      if (order === 'preOrder') callback(node);
      traverse(node.left);
      if (order === 'inOrder') callback(node);
      traverse(node.right);
      if (order === 'postOrder') callback(node);
    };
    traverse(root);
  };

  const inOrderForEach = (callback) => depthFirstForEach(callback, 'inOrder');
  const preOrderForEach = (callback) => depthFirstForEach(callback, 'preOrder');
  const postOrderForEach = (callback) => depthFirstForEach(callback, 'postOrder');

  // height(value)
  const height = (value) => {
    const startNode = find(value);
    if (!startNode) return null;

    const calculateNodeHeight = (node) => {
      if (node === null) return -1;
      const leftHeight = calculateNodeHeight(node.left);
      const rightHeight = calculateNodeHeight(node.right);
      return Math.max(leftHeight, rightHeight) + 1;
    };
    return calculateNodeHeight(startNode);
  };

  // depth(value)
  const depth = (value) => {
    if (!find(value)) return null;

    let currentNode = root;
    let currentDepth = 0;
    while (currentNode !== null) {
      if (currentNode.data === value) return currentDepth;
      if (value < currentNode.data) {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }
      currentDepth++;
    }
    // Should be caught by the initial find check, but just in case
    return null;
  };

  // isBalanced()
  const isBalanced = () => {
    const checkBalanceRecursive = (node) => {
      if (node === null) return { balanced: true, height: -1 };

      const left = checkBalanceRecursive(node.left);
      const right = checkBalanceRecursive(node.right);

      const balanced = left.balanced && right.balanced && Math.abs(left.height - right.height) <= 1;
      const currentHeight = Math.max(left.height, right.height) + 1;

      return { balanced, height: currentHeight };
    };
    return checkBalanceRecursive(root).balanced;
  };

  // rebalance()
  const rebalance = () => {
    // 1. Get all nodes in order into a sorted array
    const nodes = [];
    inOrderForEach(node => nodes.push(node.data));
    
    // 2. Rebuild the tree from the sorted array
    root = buildTree(nodes, 0, nodes.length - 1);
  };

  return {
    getRoot,
    insert,
    deleteItem,
    find,
    levelOrderForEach,
    inOrderForEach,
    preOrderForEach,
    postOrderForEach,
    height,
    depth,
    isBalanced,
    rebalance,
    prettyPrint: () => prettyPrint(root),
  };
};

// --- Driver Script ---

// Function to generate an array of random numbers
const generateRandomArray = (size, max) => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max));
};

// Helper function to print traversal results nicely
const printTraversal = (tree) => {
    const results = {
        levelOrder: [],
        preOrder: [],
        postOrder: [],
        inOrder: [],
    };
    tree.levelOrderForEach(node => results.levelOrder.push(node.data));
    tree.preOrderForEach(node => results.preOrder.push(node.data));
    tree.postOrderForEach(node => results.postOrder.push(node.data));
    tree.inOrderForEach(node => results.inOrder.push(node.data));
    console.log("Level Order:", results.levelOrder.join(', '));
    console.log("Pre Order:  ", results.preOrder.join(', '));
    console.log("Post Order: ", results.postOrder.join(', '));
    console.log("In Order:   ", results.inOrder.join(', '));
};

console.log("--- 1. Initial Tree Setup & Confirmation ---");

// 1. Create a binary search tree from an array of random numbers < 100.
const randomArray = generateRandomArray(15, 100);
console.log("Initial array:", randomArray.join(', '));
const bst = Tree(randomArray);

console.log("\nPretty Print Initial Tree:");
bst.prettyPrint();

// 2. Confirm that the tree is balanced by calling isBalanced.
console.log("\nIs the tree balanced?", bst.isBalanced()); // Should be true

// 3. Print out all elements in level, pre, post, and in order.
console.log("\n--- 2. Traversal Output ---");
printTraversal(bst);

console.log("\n--- 3. Unbalancing the Tree ---");

// 4. Unbalance the tree by adding several numbers > 100 (which will force a skewed right side).
bst.insert(200);
bst.insert(300);
bst.insert(400);
bst.insert(500);
bst.insert(550);

console.log("Pretty Print Unbalanced Tree (added 200, 300, 400, 500, 550):");
bst.prettyPrint();

// 5. Confirm that the tree is unbalanced by calling isBalanced.
console.log("\nIs the tree balanced now?", bst.isBalanced()); // Should be false

console.log("\n--- 4. Rebalancing and Final Confirmation ---");

// 6. Balance the tree by calling rebalance.
bst.rebalance();

console.log("Pretty Print Rebalanced Tree:");
bst.prettyPrint();

// 7. Confirm that the tree is balanced by calling isBalanced.
console.log("\nIs the tree balanced after rebalance?", bst.isBalanced()); // Should be true

// 8. Print out all elements in level, pre, post, and in order.
console.log("\nTraversal Output after Rebalancing:");
printTraversal(bst);