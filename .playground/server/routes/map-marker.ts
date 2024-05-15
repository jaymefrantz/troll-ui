export default defineEventHandler(async event => {
  const { color } = getQuery(event)
  const fill = color || "000"
  return `<svg fill="#${fill}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 100">
  <path d="m0,2.592v96.2098C0,99.8225,1.1965,100.3741,1.9726,99.7111l44.9071-38.3582c.7109-.6072,1.1202-1.4952,1.1202-2.4301V2.592c0-.6605-.5354-1.1959-1.1959-1.1959H1.1959C.5354,1.3961,0,1.9315,0,2.592Z" style="stroke-width: 0px;"/>
</svg>`
})