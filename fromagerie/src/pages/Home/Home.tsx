import "./Home.module.css"
import Navigation from "../../reusable_sections/Header"
import Ecosystem from "./sections/Ecosystem"
import Performance from "./sections/Performance"
import Workflow from "./sections/Workflow"
import Traceability from "./sections/Traceability"
import Production from "./sections/Production"
import Legal from "../../reusable_sections/Footer"

export default function HomePage() {

  return (
    <div>
      <Navigation />
      <Ecosystem />
      <Performance />
      <Workflow />
      <Traceability />
      <Production />
      <Legal />
    </div>
  )
}
