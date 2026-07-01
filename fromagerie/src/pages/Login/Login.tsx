import "./Login.module.css"
import Navigation from "./../../reusable_sections/Header"
import Authentication from "./sections/Authentication"
import Legal from "./../../reusable_sections/Footer"

export default function LoginPage() {

  return (
    <div>
      <Navigation />
      <Authentication />
      <Legal />
    </div>
  )
}
