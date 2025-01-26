# 017 Logging in Users with Our API - Part 2

---

## Building Login Functionality - Part 2

In this session, we focus on conditionally rendering parts of our web page based on the user’s login status. This involves creating middleware to identify if a user is logged in and using that information to render dynamic elements like login/logout buttons or user menus on the frontend.

---

## **Objective**

1. Render **login** and **sign-up** buttons if the user is **not logged in**.
2. Render a **user menu** and **logout button** if the user **is logged in**.

To achieve this, we will:

- Create middleware to detect the login status of the user.
- Use the middleware to dynamically adjust the rendered content of our web page.

---

## **How Does the Template Know the User’s Login Status?**

To determine whether the user is logged in, we need a middleware function that:

1. **Verifies if a token exists in the cookie**.
2. **Validates the token**.
3. **Checks if the user exists** and whether their password was recently changed.
4. If all conditions are met, **provides the user’s details to the templates** for rendering the dynamic content.

This middleware will **run for every request** made to the rendered website.

---

## **Implementing Middleware in `authController`**

### **Creating the `isLoggedIn` Middleware**

The new middleware function, `isLoggedIn`, is designed for rendered pages. It doesn’t protect routes or throw errors but ensures the backend identifies if the user is logged in.

### **Steps to Create the Middleware**

1. **Check for Token in Cookies**
   - Unlike API routes, which rely on tokens in headers, rendered pages send tokens in cookies.
   - Retrieve the token from `req.cookies.jwt`.
2. **Verify the Token**
   - Use `jwt.verify()` to validate the token.
   - If invalid, proceed to the next middleware without an error.
3. **Check User Existence**
   - Query the database to confirm the user associated with the token still exists.
4. **Check Password Change**
   - Confirm the user hasn’t changed their password after the token was issued.
5. **Pass User Data to Templates**
   - If all checks pass, store the user’s details in `res.locals.user`.
   - Templates can now access `user` dynamically.
6. **Handle No Token Scenario**
   - If no token exists, immediately call `next()` to proceed without setting `res.locals.user`.

---

### **Code Example**

```jsx
exports.isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) return next(); // No token, move to the next middleware.

  try {
    // 1. Verify the token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    // 2. Check if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    // 3. Check if password has changed after token issue
    if (currentUser.changedPasswordAfter(decoded.iat)) return next();

    // 4. Pass user to templates
    res.locals.user = currentUser;
    return next();
  } catch (err) {
    return next(); // Move on if any error occurs
  }
};
```

---

## **Applying Middleware to Routes**

To ensure all rendered pages have access to the user’s login status:

- Apply `isLoggedIn` middleware to all routes in `viewRoutes`.

### **Code Example**

```jsx
router.use(authController.isLoggedIn);
```

This ensures that `isLoggedIn` runs before any route handlers, making `res.locals.user` available in all templates.

---

## **Using the User Data in Templates**

### **Dynamic Rendering with Pug**

Using the `user` variable in Pug templates allows conditional rendering based on login status.

### **Example: Conditional Rendering in the Header**

```
if user
  // User is logged in
  li.nav-item
    a.nav-link.logout Log out
    span Welcome #{user.name.split(' ')[0]}!
    img(src=`/img/users/${user.photo}` alt=`${user.name}`)
else
  // User is not logged in
  li.nav-item
    a.nav-link(href='/login') Login
  li.nav-item
    a.nav-link(href='/signup') Sign Up
```

- **Logic**:
  - If `user` exists, display their name, profile picture, and a logout button.
  - If not, show login and signup options.
- **Note**: To display only the first name, we split `user.name` by spaces and use the first element.

---

## **Testing the Functionality**

1. **Login Flow**:
   - Log in as a user.
   - Verify the cookie is set.
   - Reload the page to see the user’s name and profile picture.
2. **Logout Flow**:
   - Delete the cookie to simulate logging out.
   - Reload the page to revert to the default state.

---

## **Handling Errors**

1. **Duplicate Middleware Execution**:
   - Ensure `next()` is called only once. Avoid multiple calls by returning immediately after `next()`.
2. **Token or User Issues**:
   - If token verification or user checks fail, skip setting `res.locals.user` and move on.

---

## **Key Takeaways**

1. Middleware can dynamically enrich the data available to templates, enabling conditional rendering.
2. `res.locals` is a powerful way to pass variables to templates globally.
3. Cookies are the preferred method for transferring tokens in rendered pages.
4. Proper error handling and flow control in middleware prevent bugs and ensure smooth functionality.

---

By following these steps, you can implement a robust login system that dynamically adapts to user states and provides a seamless experience on the frontend.
