export const EXAMPLE_CODES: Record<string, { code: string; language: string; title: string }> = {
  python_loop: {
    title: "Debug Python Loop",
    language: "Python",
    code: `def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers))
        total += numbers[i]
    return total

result = calculate_sum([1, 2, 3, 4, 5])
print("Sum:", result)`,
  },
  java_null: {
    title: "Java NullPointer Error",
    language: "Java",
    code: `public class Main {
    public static void main(String[] args) {
        String name = null;
        int length = name.length();
        System.out.println("Name length: " + length);
    }
}`,
  },
  html_layout: {
    title: "HTML Layout Issue",
    language: "HTML",
    code: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <div class="container">
        <h1>Welcome</h>
        <p>This is a paragraph<p>
        <img src="image.png">
    </div>
</body>
</html>`,
  },
  js_async: {
    title: "JavaScript Async Error",
    language: "JavaScript",
    code: `async function fetchData() {
    const response = fetch('https://api.example.com/data');
    const data = response.json();
    console.log(data);
}

fetchData();`,
  },
  cpp_memory: {
    title: "C++ Memory Error",
    language: "C++",
    code: `#include <iostream>
using namespace std;

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    for (int i = 0; i <= 5; i++) {
        cout << arr[i] << endl;
    }
    return 0;
}`,
  },
};
