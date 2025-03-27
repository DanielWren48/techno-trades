import { Request, Response, NextFunction, Router } from "express";
import { CustomResponse } from "../config/utils";
import { NotFoundError } from "../config/handlers";
import { authMiddleware, staff } from "../middlewares/auth";
import { Order } from "../models/order";

const orderRouter = Router();

orderRouter.patch('/update-shipping-status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, status } = req.body

        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { deliveryStatus: status } },
            { new: true }
        ).lean();

        if (!order) {
            throw new NotFoundError("Orders not found")
        }
        return res.status(200).json(CustomResponse.success(`Order status updated to ${status} successfully`, { order }))

    } catch (error) {
        next(error)
    }
});

orderRouter.get('/my-orders', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const orders = await Order.find({ user: user._id }).populate({
            path: 'products.product',
            model: 'Product',
        });
        if (!orders) {
            throw new NotFoundError("Orders not founddddd")
        }
        return res.status(200).json(CustomResponse.success("OK", { orders }))
    } catch (error) {
        next(error)
    }
});

orderRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id).populate({
            path: 'user',
            model: 'User',
        }).populate({
            path: 'products.product',
            model: 'Product',
        });
        if (!order) {
            throw new NotFoundError("Order not found")
        }
        return res.status(200).json(CustomResponse.success("OK", { order }))
    } catch (error) {
        next(error)
    }
});

orderRouter.get('/', authMiddleware, staff, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find().populate({
            path: 'user',
            model: 'User',
        })
        if (!orders) {
            throw new NotFoundError("Orders not found")
        }
        return res.status(200).json(CustomResponse.success("OK", { orders }))
    } catch (error) {
        next(error)
    }
});

export default orderRouter;