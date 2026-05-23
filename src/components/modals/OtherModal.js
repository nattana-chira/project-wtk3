export default function OtherModal({ closeRef, otherText }) {
  return (
    <div class="modal" id="otherModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <button ref={closeRef} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="modal-body">
            <div dangerouslySetInnerHTML={{ __html: otherText }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
