// @desc    Delete a photo
// @route   DELETE /api/photos/:id
// @access  Private
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    // Check if photo exists
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if user is the photo owner or an admin
    if (photo.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this photo' });
    }

    await Photo.deleteOne({ _id: req.params.id });
    res.json({ message: 'Photo removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 